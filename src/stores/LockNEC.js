/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import * as log from 'loglevel'

const objectPath = require("object-path")
const LOCK_EVENT = 'LockToken'
const RELEASE_EVENT = 'Release'
const EXTEND_LOCKING_EVENT = 'ExtendLocking'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const { BN } = helpers

export const statusCodes = {
    NOT_LOADED: 0,
    PENDING: 1,
    ERROR: 2,
    SUCCESS: 3
}

const defaultLoadingStatus = statusCodes.NOT_LOADED

const defaultAsyncActions = {
    lock: false,
    extendLock: {},
    redeem: {},
    release: {}
}

const propertyNames = {
    STATIC_PARAMS: 'staticParams',
    USER_LOCKS: 'userLocks',
    AUCTION_DATA: 'auctionData'
}
export default class LockNECStore {
    // Static Parameters
    @observable staticParams = {
        numLockingPeriods: '',
        lockingPeriodLength: '',
        startTime: '',
        agreementHash: '',
        maxLockingBatches: ''
    }

    // Dynamic Data
    @observable userLocks = {}
    @observable auctionData = {}

    @observable initialLoad = {
        staticParams: false,
        globalAuctionData: false,
    }

    @observable asyncActions = defaultAsyncActions

    @observable releaseActions = {}

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    //TODO: Do this when switching accounts in metamask
    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setLockActionPending(flag) {
        objectPath.set(this.asyncActions, `lock`, flag)
    }

    setRedeemActionPending(userAddress, lockId, flag) {
        objectPath.set(this.asyncActions, `redeem.${userAddress}.${lockId}`, flag)
    }

    setExtendLockActionPending(userAddress, lockId, flag) {
        objectPath.set(this.asyncActions, `extendLock.${userAddress}.${lockId}`, flag)
    }

    setReleaseActionPending(lockId, flag) {
        const lockIdString = lockId.toString()
        objectPath.set(this.releaseActions, `${lockIdString}`, flag)
    }

    isOverviewLoaded(userAddress) {
        if (!this.userLocks[userAddress]) {
            return false
        }

        return this.userLocks[userAddress].initialLoad
    }

    isLockActionPending() {
        const flag = objectPath.get(this.asyncActions, `lock`) || false
        return flag
    }

    isRedeemActionPending(userAddress, lockId) {
        const flag = objectPath.get(this.asyncActions, `redeem.${userAddress}.${lockId}`) || false
        return flag
    }

    isExtendLockActionPending(userAddress, lockId) {
        return objectPath.get(this.asyncActions, `extendLock.${userAddress}.${lockId}`) || false
    }

    isReleaseActionPending(lockId) {
        const lockIdString = lockId.toString()
        return objectPath.get(this.releaseActions, `${lockIdString}`) || false
    }

    getBatchStartTime(batchIndex) {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength

        return (startTime + (batchIndex * batchTime))
    }

    getTimeUntilNextPeriod() {
        const currentBatch = this.getActiveLockingPeriod()
        const now = this.rootStore.timeStore.currentTime
        const nextBatchStartTime = this.getBatchStartTime(currentBatch + 1)

        return (nextBatchStartTime - now)
    }

    getFinalPeriodIndex() {
        return (this.staticParams.numLockingPeriods - 1)
    }

    isLockingStarted() {
        const now = this.rootStore.timeStore.currentTime
        const startTime = this.staticParams.startTime
        return (now >= startTime)
    }

    isLockingEnded() {
        const now = this.rootStore.timeStore.currentTime
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength
        const numAuctions = this.staticParams.numLockingPeriods

        const endTime = startTime + (batchTime * numAuctions)
        return (now >= endTime)
    }

    calcReleaseableTimestamp(lockingTime, duration) {
        const lockTime = Number(lockingTime)
        const batchLength = Number(this.staticParams.lockingPeriodLength)
        const numBatches = Number(duration)

        const lockLength = batchLength * numBatches
        const endDate = new Date(lockTime + lockLength)

        return endDate.valueOf()
    }

    initializeUserLocksObject() {
        return {
            data: {},
            initialLoad: false
        }
    }

    setUserLocksProperty(userAddress, property, value) {
        if (!this.userLocks[userAddress]) {
            this.userLocks[userAddress] = this.initializeUserLocksObject()
        }

        this.userLocks[userAddress][property] = value

        log.info('[Set] UserLock', userAddress, property, value)
    }

    isStaticParamsInitialLoadComplete() {
        return this.initialLoad.staticParams
    }

    isUserLockInitialLoadComplete(userAddress) {
        if (!this.userLocks[userAddress]) {
            return false
        }

        return this.userLocks[userAddress].initialLoad
    }

    isAuctionDataInitialLoadComplete(userAddress) {
        return true
        // if (!this.auctionData[userAddress]) {
        //     return false
        // }

        // return this.auctionData[userAddress].initialLoad
    }

    getLockingPeriodByTimestamp(timestamp) {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength
        const timeElapsed = timestamp - startTime
        const lockingPeriod = timeElapsed / batchTime


        return Math.trunc(lockingPeriod)
    }

    loadContract() {
        return blockchain.loadObject('ContinuousLocking4Reputation', deployed.ContinuousLocking4Reputation, 'ContinuousLocking4Reputation')
    }

    getActiveLockingPeriod() {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength
        const currentTime = this.rootStore.timeStore.currentTime
        const timeElapsed = currentTime - startTime
        const currentLockingPeriod = timeElapsed / batchTime

        return Math.trunc(currentLockingPeriod)
    }

    getTimeElapsed() {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.startTime)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))

        const timeElapsed = currentTime.sub(startTime)

        return timeElapsed.toString()
    }

    getUserTokenLocks(userAddress) {
        if (!this.userLocks[userAddress]) {
            this.userLocks[userAddress] = this.initializeUserLocksObject()
        }

        return this.userLocks[userAddress]
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        try {
            const numLockingPeriods = await contract.methods.batchesIndexCap().call()
            const lockingPeriodLength = await contract.methods.batchTime().call()
            const startTime = await contract.methods.startTime().call()
            const maxLockingBatches = await contract.methods.maxLockingBatches().call()
            const agreementHash = await contract.methods.getAgreementHash().call()

            this.staticParams = {
                numLockingPeriods: Number(numLockingPeriods),
                lockingPeriodLength: Number(lockingPeriodLength),
                startTime: Number(startTime),
                agreementHash,
                maxLockingBatches: Number(maxLockingBatches),
            }

            this.initialLoad.staticParams = true
        } catch (e) {
            log.error(e)
        }
    }

    @action fetchUserLocks = async (userAddress) => {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const { graphStore } = this.rootStore

        // I think we can get the latest for each lock, and then do the locker searches for now. Subgraph will be able to do this later by getting CALLS - except it can't do that on rinkeby?? 

        // Can we get the LOCKING TIME by the blocktime of the TX?

        const contract = this.loadContract()
        const currentBlock = this.rootStore.timeStore.currentBlock
        log.info('[Fetch] Fetching User Locks', userAddress)

        try {
            const data = {}
            const events = await contract.events.LockToken()
            console.log(events)

            const locks = await graphStore.fetchLocks(userAddress)

            console.log(locks)
            const batchTime = this.staticParams.lockingPeriodLength

            // Add Locks
            for (const lock of locks) {
                const {
                    id, locker, period, amount, released, lockTimestamp, periodDuration
                } = lock

                const a = helpers.toChecksum(userAddress)
                const b = helpers.toChecksum(locker)

                // console.log('address check', a, b, a == b)

                if (a != b) {
                    continue
                }

                console.log('lock', lock)

                const lockingPeriod = this.getLockingPeriodByTimestamp(lockTimestamp)
                const lockDuration = periodDuration * batchTime
                const releasable = lockTimestamp + lockDuration



                data[id] = {
                    userAddress: locker,
                    lockId: id,
                    amount: amount,
                    duration: period,
                    lockingPeriod,
                    releasable,
                    released
                }
            }

            console.log('[Fetched] User Locks', userAddress, data)
            this.setUserLocksProperty(userAddress, 'data', data)
            this.setUserLocksProperty(userAddress, 'initialLoad', true)

        } catch (e) {
            log.error(e)
        }
    }

    @action fetchOverview = async (userAddress) => {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }
    }

    lock = async (amount, duration, batchId) => {
        const contract = this.loadContract()
        log.error(
            '[Action] Lock',
            `amount: ${amount} \n duration: ${duration} \n batchId:${batchId} \n agreementHash: ${AGREEMENT_HASH}`)
        this.setLockActionPending(true)
        try {
            await contract.methods.lock(amount, duration, batchId, AGREEMENT_HASH).send()
            this.setLockActionPending(false)
        } catch (e) {
            log.error(e)
            this.setLockActionPending(false)
        }

    }

    extendLock = async (lockId, periodsToExtend, batchId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.setExtendLockActionPending(userAddress, lockId, true)
        log.info('extendLock', lockId, periodsToExtend, batchId)

        try {
            await contract.methods.extendLocking(periodsToExtend, batchId, lockId, AGREEMENT_HASH).send()
            this.setExtendLockActionPending(userAddress, lockId, false)
        } catch (e) {
            log.error(e)
            this.setExtendLockActionPending(userAddress, lockId, false)
        }

    }

    release = async (beneficiary, lockId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.setReleaseActionPending(lockId, true)
        log.info('release', beneficiary, lockId)

        try {
            await contract.methods.release(beneficiary, lockId).send()
            this.setReleaseActionPending(lockId, false)
            this.fetchUserLocks(userAddress)
        } catch (e) {
            log.error(e)
            this.setReleaseActionPending(lockId, false)
        }

    }

}