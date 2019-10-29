/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import { deployed } from "config.json"
import BigNumber from 'bignumber.js'
import * as log from 'loglevel'
import { BidStaticParams, Auction, AuctionStatus } from 'types'
import { RootStore } from './Root'
import { logs, errors, prefix } from 'strings'

const objectPath = require("object-path")

const BID_EVENT = 'Bid'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

interface BidEvent {
    bidder: string;
    auctionId: number,
    amount: BigNumber
}

const defaultAsyncActions = {
    bid: false,
    redeem: {}
}

type Bids = Map<string, BigNumber>
type AuctionData = Map<number, Auction>

export default class BidGENStore {
    // Static Parameters
    @observable staticParams!: BidStaticParams
    @observable staticParamsLoaded = false

    // Dynamic Data
    @observable repRewardLeft: BigNumber = new BigNumber(0)
    @observable auctionData: AuctionData = new Map<number, Auction>()
    @observable auctionDataLoaded = false
    @observable auctionCount = 0

    @observable asyncActions = defaultAsyncActions

    private rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    resetData() {
        // Static Parameters
        this.staticParams = {} as BidStaticParams
        this.staticParamsLoaded = false

        // Dynamic Data
        this.repRewardLeft = new BigNumber(0)
        this.auctionData = new Map<number, Auction>()
        this.auctionDataLoaded = false
        this.auctionCount = 0
        this.asyncActions = defaultAsyncActions
    }

    getTrackedAuctionCount() {
        return this.auctionCount
    }

    getUserBid(userAddress: string, auctionId: number): BigNumber {
        if (!this.auctionData.has(auctionId)) {
            throw new Error(`Attempting to access non-existent user data for ${userAddress} in auction ${auctionId}`);
        }

        const auction = this.auctionData.get(auctionId) as Auction
        const userBid = auction.bids[userAddress] || new BigNumber(0)
        return userBid
    }

    getUserRep(userAddress: string, auctionId: number): BigNumber {
        if (!this.auctionData.has(auctionId)) {
            throw new Error(`Attempting to access non-existent user data for ${userAddress} in auction ${auctionId}`);
        }

        const auction = this.auctionData.get(auctionId) as Auction
        return auction.rep[userAddress] || new BigNumber(0)
    }

    getTotalBid(auctionId) {
        const auction = this.auctionData.get(auctionId) as Auction
        return auction.totalBid
    }

    getAuctionStatus(auctionId) {
        const auction = this.auctionData.get(auctionId) as Auction
        return auction.status
    }

    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setBidActionPending(flag) {
        objectPath.set(this.asyncActions, `bid`, flag)
    }

    setRedeemActionPending(beneficiary, auctionId, flag) {
        objectPath.set(this.asyncActions, `redeem.${beneficiary}.${auctionId}`, flag)
    }

    isBidActionPending() {
        const flag = objectPath.get(this.asyncActions, `bid`) || false
        return flag
    }

    isRedeemActionPending(beneficiary, auctionId) {
        const flag = objectPath.get(this.asyncActions, `redeem.${beneficiary}.${auctionId}`) || false
        return flag
    }

    areStaticParamsLoaded(): boolean {
        return this.staticParamsLoaded
    }

    isAuctionDataLoaded(): boolean {
        return this.auctionDataLoaded
    }

    getFinalAuctionIndex(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        return Number(this.staticParams.numAuctions) - 1
    }

    haveAuctionsStarted(): boolean {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        const now = this.rootStore.timeStore.currentTime
        const startTime = this.staticParams.auctionsStartTime

        if (now >= startTime) {
            return true
        }
        return false
    }

    areAuctionsOver(): boolean {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        const now = this.rootStore.timeStore.currentTime
        const endTime = this.staticParams.auctionsEndTime

        if (now > endTime) {
            return true
        }
        return false
    }

    loadContract() {
        return this.rootStore.providerStore.loadObject('Auction4Reputation', deployed.Auction4Reputation, 'Auction4Reputation')
    }

    getActiveAuction(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        const startTime = this.staticParams.auctionsStartTime
        const currentTime = this.rootStore.timeStore.currentTime
        const auctionLength = this.staticParams.auctionLength

        const timeElapsed = currentTime - startTime
        const currentAuction = timeElapsed / auctionLength

        //Edge case for the wierd -0 issue
        if (currentAuction < 0 && currentAuction > -1) {
            return -1
        }
        return Math.trunc(currentAuction)
    }

    getNextAuctionStartTime(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        const startTime = this.staticParams.auctionsStartTime
        const auctionLength = this.staticParams.auctionLength

        const activeAuctionIndex = this.getActiveAuction()
        const nextAuctionIndex = activeAuctionIndex + 1
        const duration = (auctionLength * nextAuctionIndex)
        const nextAuctionStartTime = startTime + duration
        return nextAuctionStartTime
    }

    getTimeUntilNextAuction(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(errors.staticParamsNotLoaded)
        }

        const currentTime = this.rootStore.timeStore.currentTime
        const nextAuctionStartTime = this.getNextAuctionStartTime()
        const timeUntilNextAuction = nextAuctionStartTime - currentTime
        return timeUntilNextAuction
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        log.debug(prefix.FETCH_PENDING, 'BidGEN Static Params')

        try {
            const auctionsStartTime = await contract.methods.auctionsStartTime().call()
            const auctionsEndTime = await contract.methods.auctionsEndTime().call()
            const auctionLength = await contract.methods.auctionPeriod().call()
            const numAuctions = await contract.methods.numberOfAuctions().call()
            const redeemEnableTime = await contract.methods.redeemEnableTime().call()
            const auctionRepReward = await contract.methods.auctionReputationReward().call()

            this.staticParams = {
                auctionsStartTime: Number(auctionsStartTime),
                auctionsEndTime: Number(auctionsEndTime),
                auctionLength: Number(auctionLength),
                numAuctions: Number(numAuctions),
                redeemEnableTime: Number(redeemEnableTime),
                auctionRepReward: new BigNumber(auctionRepReward)
            }

            this.staticParamsLoaded = true
            log.debug(prefix.FETCH_SUCCESS, 'BidGEN Static Params')

        } catch (e) {
            log.debug(prefix.FETCH_ERROR, 'BidGEN Static Params')
            log.error(e)
        }
    }

    newAuction(): Auction {
        return new Auction(
            new BigNumber(0),
            new Map<string, BigNumber>(),
            AuctionStatus.NOT_STARTED,
            new Map<string, BigNumber>()
        )
    }

    parseBidEvent(event): BidEvent {
        const { _bidder, _auctionId, _amount } = event.returnValues

        return {
            bidder: _bidder,
            auctionId: Number(_auctionId),
            amount: new BigNumber(_amount)
        }
    }

    calcAuctionReward(auction: Auction, user: string): BigNumber {
        const userBid = auction.bids[user] as BigNumber
        const totalBid = auction.totalBid
        const totalReward = this.staticParams.auctionRepReward

        const repRelation = userBid.times(totalReward)
        const reward = repRelation.div(totalBid)
        return reward
    }

    @action fetchAuctionData = async () => {
        if (!this.areStaticParamsLoaded()) {
            await this.fetchStaticParams()
        }

        log.debug(prefix.FETCH_PENDING, 'auctionData')

        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()

        try {
            const finalAuction = this.getFinalAuctionIndex()
            let currentAuction = this.getActiveAuction()
            const auctionsEnded = this.areAuctionsOver()

            if (currentAuction > finalAuction) {
                currentAuction = finalAuction
            }

            const bidEvents = await contract.getPastEvents(BID_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            const auctions = new Map<number, Auction>()

            if (currentAuction < 0) {
                this.auctionDataLoaded = false
                this.auctionData = auctions
            }

            for (let auctionId = 0; auctionId <= currentAuction; auctionId += 1) {
                const auction = this.newAuction()

                if (auctionId < currentAuction) {
                    auction.status = AuctionStatus.COMPLETE
                } else if (auctionId === finalAuction && auctionsEnded) {
                    auction.status = AuctionStatus.COMPLETE
                }
                else if (auctionId === currentAuction) {
                    auction.status = AuctionStatus.IN_PROGRESS
                } else {
                    auction.status = AuctionStatus.NOT_STARTED
                }

                auctions.set(auctionId, auction)
            }

            for (const event of bidEvents) {
                const bid = this.parseBidEvent(event)

                if (!auctions.has(bid.auctionId)) {
                    throw new Error(`Auction ID ${bid.auctionId} in Event isn't valid`)
                }
                const auction = auctions.get(bid.auctionId) as Auction

                if (!auction.bids[bid.bidder]) {
                    auction.bids[bid.bidder] = new BigNumber(0)
                }

                const currentBid = auction.bids[bid.bidder]
                const amountToAdd = bid.amount

                auction.bids[bid.bidder] = (currentBid.plus(amountToAdd))

                const currentTotalBid = auction.totalBid
                auction.totalBid = (currentTotalBid.plus(amountToAdd))

                auctions.set(bid.auctionId, auction)
            }

            auctions.forEach((auction, key, map) => {
                if (auction.status === AuctionStatus.COMPLETE && auction.bids[userAddress]) {
                    const repReward = this.calcAuctionReward(auction, userAddress)
                    auction.rep[userAddress] = repReward
                    auctions.set(key, auction)
                }
            })

            this.auctionData = auctions
            this.auctionCount = Number(currentAuction) + 1
            this.auctionDataLoaded = true
            log.debug(prefix.FETCH_SUCCESS, 'auctionData')
        } catch (e) {
            log.debug(prefix.FETCH_ERROR, 'auctionData')
            log.error(e)
        }
    }

    bid = async (amount, auctionId) => {
        const contract = this.loadContract()

        log.debug(prefix.ACTION_PENDING, 'bid', amount, auctionId)
        this.setBidActionPending(true)
        try {
            await contract.methods.bid(amount, auctionId, AGREEMENT_HASH).send()
            this.setBidActionPending(false)
            log.debug(prefix.ACTION_SUCCESS, 'bid', amount, auctionId)
        } catch (e) {
            log.debug(prefix.ACTION_ERROR, 'bid', amount, auctionId)
            log.error(e)
            this.setBidActionPending(false)
        }

    }

    redeem = async (beneficiary, auctionId) => {
        const contract = this.loadContract()

        log.debug(prefix.ACTION_PENDING, 'redeem', beneficiary, auctionId)
        this.setRedeemActionPending(beneficiary, auctionId, true)

        try {
            await contract.methods.redeem(beneficiary, auctionId).send()
            this.setRedeemActionPending(beneficiary, auctionId, false)
            log.debug(prefix.ACTION_SUCCESS, 'redeem', beneficiary, auctionId)
        } catch (e) {
            log.debug(prefix.ACTION_ERROR, 'redeem', beneficiary, auctionId)
            log.error(e)
            this.setRedeemActionPending(beneficiary, auctionId, false)
        }

    }
}