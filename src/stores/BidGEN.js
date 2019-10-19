/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed"
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import Big from 'big.js/big.mjs'
import * as log from 'loglevel'

const objectPath = require("object-path")

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

const text = {
    staticParamsNotLoaded: 'Static params must be loaded to call this function'
}

const propertyNames = {
    STATIC_PARAMS: 'staticParams',
    REP_REWARD_LEFT: 'repRewardLeft',
    AUCTION_DATA: 'auctionData'
}

const defaultAsyncActions = {
    bid: false,
    redeem: {}
}
export default class BidGENStore {
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

    @observable asyncActions = defaultAsyncActions

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setBidActionPending(flag) {
        objectPath.set(this.asyncActions, `bid`, flag)
    }

    setRedeemActionPending(userAddress, beneficiary, auctionId, flag) {
        objectPath.set(this.asyncActions, `redeem.${userAddress}.${auctionId}`, flag)
    }

    isBidActionPending() {
        const flag = objectPath.get(this.asyncActions, `bid`) || false
        return flag
    }

    isRedeemActionPending(beneficiary, auctionId) {
        const flag = objectPath.get(this.asyncActions, `redeem.${beneficiary}.${auctionId}`) || false
        return flag
    }

    setLoadingStatus(propertyName, status) {
        objectPath.set(this.loadingStatus, `${propertyName}.status`, status)
    }

    setInitialLoad(propertyName, initialLoad) {
        objectPath.set(this.loadingStatus, `${propertyName}.initialLoad`, initialLoad)
    }

    getFinalAuctionIndex() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        return Number(this.staticParams.numAuctions) - 1
    }

    haveAuctionsStarted() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        const currentAuction = this.getActiveAuction()

        if (currentAuction >= 0) {
            return true
        }
        return false
    }

    areAuctionsOver() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        const currentAuction = this.getActiveAuction()
        const lastAuction = this.getFinalAuctionIndex()

        if (currentAuction > lastAuction) {
            return true
        }
        return false
    }

    isPropertyInitialLoadComplete(propertyName, userAddress = null) {
        if (objectPath.get(this.loadingStatus, `${propertyName}.initialLoad`)) {
            return true
        }

        return false
    }

    getLoadStatus(propertyName, userAddress = null) {
        return objectPath.get(this.loadingStatus, `${propertyName}.${userAddress}.initialLoad`) || statusCodes.NOT_LOADED
    }

    loadContract() {
        return blockchain.loadObject('Auction4Reputation', deployed.Auction4Reputation, 'Auction4Reputation')
    }

    getActiveAuction() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        const startTime = new BN(this.staticParams.auctionsStartTime)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))
        const auctionLength = new BN(this.staticParams.auctionLength)

        const timeElapsed = currentTime.sub(startTime)
        const currentAuction = timeElapsed.div(auctionLength)

        // const maxAuctions = this.staticParams.numAuctions
        // if (currentAuction.toNumber() > maxAuctions) {
        //     return maxAuctions.toString()
        // }
        return currentAuction.toString()
    }

    getNextAuctionStartTime() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        const startTime = new BN(this.staticParams.auctionsStartTime)
        const auctionLength = new BN(this.staticParams.auctionLength)

        const activeAuctionIndex = new BN(this.getActiveAuction())
        const nextAuctionIndex = activeAuctionIndex.add(new BN(1))

        const nextAuctionStartTime = startTime.add((auctionLength.mul(nextAuctionIndex)))

        return nextAuctionStartTime.toString()
    }

    getTimeUntilNextAuction(currentTime) {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }
        const currentTimeBN = new BN(currentTime)
        const nextAuctionStartTime = new BN(this.getNextAuctionStartTime())
        const timeUntilNextAuction = nextAuctionStartTime.sub(currentTimeBN)
        return timeUntilNextAuction.toString()
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.PENDING)

        try {
            const auctionsStartTime = await contract.methods.auctionsStartTime().call()
            const auctionsEndTime = await contract.methods.auctionsEndTime().call()
            const auctionLength = await contract.methods.auctionPeriod().call()
            const numAuctions = await contract.methods.numberOfAuctions().call()
            const redeemEnableTime = await contract.methods.redeemEnableTime().call()
            const auctionRepReward = await contract.methods.auctionReputationReward().call()

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
            log.error(e)
            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.ERROR)
        }
    }

    @action fetchAuctionData = async () => {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error(text.staticParamsNotLoaded)
        }

        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.AUCTION_DATA, statusCodes.PENDING)

        try {
            const finalAuction = Number(this.getFinalAuctionIndex())
            let currentAuction = Number(this.getActiveAuction())
            const auctionsEnded = this.areAuctionsOver()

            if (currentAuction > finalAuction) {
                currentAuction = finalAuction
            }

            const bidEvents = await contract.getPastEvents(BID_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            const data = []

            for (let auctionId = 0; auctionId <= currentAuction; auctionId += 1) {
                if (!data[auctionId]) {
                    data[auctionId] = {
                        totalBids: '0',
                        bids: []
                    }
                }

                if (auctionId < currentAuction) {
                    data[auctionId].status = 'Complete'
                } else if (auctionId === finalAuction && auctionsEnded) {
                    data[auctionId].status = 'Complete'
                }
                else if (auctionId === currentAuction) {
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
            log.error(e)
            this.setLoadingStatus(propertyNames.AUCTION_DATA, statusCodes.ERROR)
        }
    }

    bid = async (amount, auctionId) => {
        const contract = this.loadContract()

        this.setBidActionPending(true)
        console.log('bid', amount, auctionId)
        try {
            await contract.methods.bid(amount, auctionId, AGREEMENT_HASH).send()
            this.setBidActionPending(false)
        } catch (e) {
            log.error(e)
            this.setBidActionPending(false)
        }

    }

    redeem = async (beneficiary, auctionId) => {
        const contract = this.loadContract()

        log.info('redeem', beneficiary, auctionId)
        this.setRedeemActionPending(beneficiary, auctionId, true)

        try {
            await contract.methods.redeem(beneficiary, auctionId).send()
            this.setRedeemActionPending(beneficiary, auctionId, false)
        } catch (e) {
            log.error(e)
            this.setRedeemActionPending(beneficiary, auctionId, false)
        }

    }
}