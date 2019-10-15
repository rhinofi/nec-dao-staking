/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import abiDecoder from 'abi-decoder'
import Big from 'big.js/big.mjs';

const BID_EVENT = 'Bid'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const { BN } = helpers

export const statusCodes = {
    NOT_LOADED: 0,
    PENDING: 1,
    ERROR: 2,
    SUCCESS: 3
}

const defaultLoadingStatus = {
    status: statusCodes.NOT_LOADED,
    initialLoad: false
}

const propertyNames = {
    STATIC_PARAMS: 'staticParams',
    USER_LOCKS: 'userLocks',
    AUCTION_DATA: 'auctionData'
}
export default class LockNECStore {
    // Static Parameters
    @observable staticParams = {
        auctionsStartTime: '',
        auctionsEndTime: '',
        auctionLength: '',
        numAuctions: '',
        redeemEnableTime: '',
        auctionRepReward: ''
    }

    // Dynamic Data
    @observable repRewardLeft = ''
    @observable auctionData = {}

    // Status
    @observable loadingStatus = {
        staticParams: defaultLoadingStatus,
        repRewardLeft: defaultLoadingStatus,
        auctionData: defaultLoadingStatus
    }

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    setLoadingStatus(propertyName, status, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                this.loadingStatus[propertyName][userAddress] = {}
            }

            this.loadingStatus[propertyName][userAddress] = {
                ...this.loadingStatus[propertyName],
                status
            }
        } else {
            this.loadingStatus[propertyName] = {
                ...this.loadingStatus[propertyName],
                status
            }
        }
    }

    setInitialLoad(propertyName, initialLoad, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                this.loadingStatus[propertyName][userAddress] = {}
            }

            this.loadingStatus[propertyName][userAddress] = {
                ...this.loadingStatus[propertyName],
                initialLoad
            }

        } else {
            this.loadingStatus[propertyName] = {
                ...this.loadingStatus[propertyName],
                initialLoad
            }
        }
    }

    isPropertyInitialLoadComplete(propertyName, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                return false
            }
            return this.loadingStatus[propertyName][userAddress].initialLoad
        }
        return this.loadingStatus[propertyName].initialLoad
    }

    getLoadStatus(propertyName, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                return false
            }
            return this.loadingStatus[propertyName][userAddress].status
        }
        return this.loadingStatus[propertyName].status
    }

    loadContract() {
        return blockchain.loadObject('Auction4Reputation', deployed.Auction4Reputation, 'Auction4Reputation')
    }

    getActiveAuction() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.auctionsStartTime)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))
        const auctionLength = new BN(this.staticParams.auctionLength)

        const timeElapsed = currentTime.sub(startTime)
        const currentAuction = timeElapsed.div(auctionLength)
        const maxAuctions = this.staticParams.numAuctions

        if (currentAuction.toNumber() > maxAuctions) {
            return maxAuctions.toString()
        }
        return currentAuction.toString()
    }

    getNextAuctionStartTime() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.auctionsStartTime)
        const auctionLength = new BN(this.staticParams.auctionLength)

        const activeAuctionIndex = new BN(this.getActiveAuction())
        const nextAuctionIndex = activeAuctionIndex.add(new BN(1))

        const nextAuctionStartTime = startTime.add((auctionLength.mul(nextAuctionIndex)))

        return nextAuctionStartTime.toString()
    }

    getTimeUntilNextAuction() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))
        const nextAuctionStartTime = new BN(this.getNextAuctionStartTime())

        const timeUntilNextAuction = nextAuctionStartTime.sub(currentTime)

        return timeUntilNextAuction.toString()
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.PENDING)

        try {
            const auctionsStartTime = contract.methods.auctionsStartTime().call()
            const auctionsEndTime = contract.methods.auctionsEndTime().call()
            const auctionLength = contract.methods.auctionPeriod().call()
            const numAuctions = contract.methods.numberOfAuctions().call()
            const redeemEnableTime = contract.methods.redeemEnableTime().call()
            const auctionRepReward = contract.methods.auctionReputationReward().call()

            this.staticParams = {
                auctionsStartTime,
                auctionsEndTime,
                auctionLength,
                numAuctions,
                redeemEnableTime,
                auctionRepReward,
            }

            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.SUCCESS)
            this.setInitialLoad(propertyNames.STATIC_PARAMS, true)

        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.ERROR)
        }
    }

    @action fetchAuctionData = async () => {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.AUCTION_DATA, statusCodes.PENDING)

        try {
            const maxAuctions = Number(this.staticParams.numAuctions)
            const currentAuction = Number(this.getActiveAuction())
            const nextAuctionStartTime = this.getNextAuctionStartTime()

            const bidEvents = await contract.getPastEvents(BID_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            console.log(bidEvents)
            const data = []

            for (let auctionId = 0; auctionId < maxAuctions; auctionId += 1) {
                if (!data[auctionId]) {
                    data[auctionId] = {
                        totalBids: '0',
                        bids: []
                    }
                }

                if (auctionId < currentAuction) {
                    data[auctionId].status = 'Complete'
                } else if (auctionId === currentAuction) {
                    data[auctionId].status = 'In Progress'
                } else {
                    data[auctionId].status = 'Not Started'
                }
            }

            for (const event of bidEvents) {
                const { _bidder, _auctionId, _amount } = event.returnValues

                const auctionData = data[_auctionId]

                if (!auctionData.bids[_bidder]) {
                    auctionData.bids[_bidder] = '0'
                }

                const currentBid = new BN(auctionData.bids[_bidder])
                const amountToAdd = new BN(_amount)

                auctionData.bids[_bidder] = (currentBid.add(amountToAdd)).toString()

                const currentTotalBid = new BN(auctionData.totalBids)
                auctionData.totalBids = (currentTotalBid.add(amountToAdd)).toString()
            }

            this.auctionData = data

            this.setLoadingStatus(propertyNames.AUCTION_DATA, statusCodes.SUCCESS)
            this.setInitialLoad(propertyNames.AUCTION_DATA, true)

        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.AUCTION_DATA, statusCodes.ERROR)
        }
    }

    bid = async (amount, auctionId) => {
        const contract = this.loadContract()

        console.log('bid', amount, auctionId)

        try {
            await contract.methods.bid(amount, auctionId, AGREEMENT_HASH).send()
        } catch (e) {
            console.log(e)
        }

    }

    redeem = async (beneficiary, auctionId) => {
        const contract = this.loadContract()

        console.log('redeem', beneficiary, auctionId)

        try {
            await contract.methods.redeem(beneficiary, auctionId).send()
        } catch (e) {
            console.log(e)
        }

    }
}