/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import { deployed } from "config.json"
import BigNumber from 'bignumber.js'
import * as log from 'loglevel'
import { BidStaticParams, Auction, AuctionStatus } from 'types'
import { RootStore } from './Root'
import BaseAsync from './BaseAsync'
import { logs, errors, prefix } from 'strings'
import { AuctionStaticParamsFetch } from 'services/fetch-actions/auction/AuctionStaticParamsFetch'
import { AuctionDataFetch } from 'services/fetch-actions/auction/AuctionDataFetch'
import { StatusEnum } from 'services/fetch-actions/BaseFetch'

const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const objectPath = require("object-path")

const defaultAsyncActions = {
    bid: false,
    redeem: {}
}

type Bids = Map<string, BigNumber>
type AuctionData = Map<number, Auction>

export default class BidGENStore extends BaseAsync {
    // Static Parameters
    @observable staticParams!: BidStaticParams
    @observable staticParamsLoaded = false

    // Dynamic Data
    @observable repRewardLeft: BigNumber = new BigNumber(0)
    @observable auctionData: AuctionData = new Map<number, Auction>()
    @observable auctionDataLoaded = false
    @observable auctionCount = 0

    @observable asyncActions = defaultAsyncActions

    constructor(rootStore: RootStore) {
        super(rootStore)
        this.resetData()
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
            return false
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

        const action = new AuctionStaticParamsFetch(contract, this.rootStore)
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS) {
            this.staticParams = result.data as BidStaticParams
            this.staticParamsLoaded = true
        }
    }

    @action fetchAuctionData = async () => {
        const contract = this.loadContract()

        if (!this.areStaticParamsLoaded()) {
            await this.fetchStaticParams()
        }

        const action = new AuctionDataFetch(contract, this.rootStore, {
            account: this.rootStore.providerStore.getDefaultAccount()
        })
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS) {
            this.auctionData = result.data.auctionData
            this.auctionCount = result.data.auctionCount
            this.auctionDataLoaded = result.data.auctionDataLoaded
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