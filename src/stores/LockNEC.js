/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import * as log from 'loglevel'
import Big from 'big.js/big.mjs';
Big.PE = 200

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
    BATCHES: 'batches'
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
    @observable batches = {}
    @observable batchesLoaded = false

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

    setExtendLockActionPending(lockId, flag) {
        objectPath.set(this.asyncActions, `extendLock.${lockId.toString()}`, flag)
    }

    setReleaseActionPending(lockId, flag) {
        const lockIdString = lockId.toString()
        objectPath.set(this.releaseActions, `${lockIdString}`, flag)
    }

    isLockActionPending() {
        const flag = objectPath.get(this.asyncActions, `lock`) || false
        return flag
    }

    isRedeemActionPending(userAddress, lockId) {
        const flag = objectPath.get(this.asyncActions, `redeem.${userAddress}.${lockId}`) || false
        return flag
    }

    isExtendLockActionPending(lockId) {
        return objectPath.get(this.asyncActions, `extendLock.${lockId.toString()}`) || false
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

    getBatchEndTime(batchIndex) {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength

        const nextIndex = Number(batchIndex) + 1

        return (startTime + (nextIndex * batchTime))
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

    getLockingEndTime() {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.lockingPeriodLength
        const numAuctions = this.staticParams.numLockingPeriods

        const endTime = startTime + (batchTime * numAuctions)
        return endTime
    }

    isLockingEnded() {
        const now = this.rootStore.timeStore.currentTime
        const endTime = this.getLockingEndTime()
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

    isOverviewLoadComplete(userAddress) {
        return true
        // if (!this.auctionData[userAddress]) {
        //     return false
        // }

        // return this.auctionData[userAddress].initialLoad
    }

    areBatchesLoaded(userAddress) {
        return this.batchesLoaded
    }

    getPeriodsRemaining() {
        const now = this.rootStore.timeStore.currentTime
        const endTime = this.getLockingEndTime()
        const batchTime = this.staticParams.batchTime

        const remainingTime = endTime - now
        const remainingPeriods = Math.trunc(remainingTime / batchTime)

        return remainingPeriods
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

    async parseLockEvent(event) {
        const {
            _locker, _lockingId, _amount, _period
        } = event.returnValues

        const block = await blockchain.getBlock(event.blockNumber)
        const batchTime = this.staticParams.lockingPeriodLength
        const periodDuration = Number(_period)
        const lockingPeriod = this.getLockingPeriodByTimestamp(block.timestamp)
        const lockDuration = periodDuration * batchTime
        const releasable = Number(block.timestamp) + Number(lockDuration)

        return {
            locker: _locker,
            id: _lockingId,
            amount: _amount,
            periodDuration,
            timestamp: block.timestamp,
            lockingPeriod,
            releasable
        }
    }

    async parseExtendEvent(event) {
        const {
            _locker, _lockingId, _extendPeriod
        } = event.returnValues
        const block = await blockchain.getBlock(event.blockNumber)

        return {
            locker: _locker,
            id: _lockingId,
            extendDuration: Number(_extendPeriod),
            timestamp: block.timestamp
        }
    }

    async parseReleaseEvent(event) {
        const {
            _beneficiary, _lockingId, _amount
        } = event.returnValues

        return {
            beneficiary: _beneficiary,
            id: _lockingId,
            amount: _amount
        }
    }

    calcExtendScores(lock, extend) {
        // const { lockingPeriod, duration, amount } = lock
        // const { extendDuration } = extend

        // const extendLockingPeriod = this.getLockingPeriodByTimestamp(extend.timestamp)

        // const scores = {}

        // // How many batches remain in the original lock duration at the time of this extension?
        // const remainBatches = extendLockingPeriod - lockingPeriod
        // const batchesCountFromCurrent = remainBatches + extendDuration

        // const amount = new BN(lock.amount)
        // const finalBatch = new BN(batchesCountFromCurrent)

        // for (let p = 0; p < batchesCountFromCurrent; p++) {
        //     const score = (batchesCountFromCurrent - p).mul(lock.amount);
        //     batch.totalScore = batch.totalScore.add(score).sub(batch.scores[_lockingId]);
        //     batch.scores[_lockingId] = score;
        // }
        return {}
    }

    calcLockScores(lock) {
        const { lockingPeriod, duration, amount } = lock
        const batchIndexToLockIn = Number(lockingPeriod)
        const scores = {}

        for (let p = 0; p < duration; p++) {
            const batchId = batchIndexToLockIn + p
            const diff = new Big((duration - p))
            const amountBig = new Big(amount)
            const score = (diff).mul(amountBig);
            scores[batchId] = score;
        }
        return scores
    }

    @action fetchUserLocks = async (userAddress) => {
        if (!this.initialLoad.staticParams) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        // Can we get the LOCKING TIME by the blocktime of the TX?

        const contract = this.loadContract()
        log.info('[Fetch] Fetching User Locks', userAddress)

        try {
            const locks = {}
            const events = await contract.events.LockToken()
            console.log(events)

            const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const extendEvents = await contract.getPastEvents(EXTEND_LOCKING_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const releaseEvents = await contract.getPastEvents(RELEASE_EVENT, {
                filter: { _beneficiary: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            console.log('lockEvents', lockEvents)
            console.log('extendEvents', extendEvents)
            console.log('releaseEvents', releaseEvents)

            // Add Locks
            for (const event of lockEvents) {
                const lock = await this.parseLockEvent(event)

                const scores = this.calcLockScores(lock)
                console.log('scores', scores)

                locks[lock.id] = {
                    userAddress,
                    lockId: lock.id,
                    amount: lock.amount,
                    duration: lock.periodDuration,
                    scores,
                    lockingPeriod: lock.lockingPeriod,
                    releasable: lock.releasable,
                    released: false,
                }
            }

            for (const event of extendEvents) {
                const extend = await this.parseExtendEvent(event)
                // const scores = calcExtendScores(locks[extend.id], extend)

                const oldDuration = locks[extend.id].duration
                const newDuration = Number(oldDuration) + extend.extendDuration

                locks[extend.id].duration = newDuration
            }

            for (const event of releaseEvents) {
                const release = await this.parseReleaseEvent(event)
                //If a release event exists for an id, it was released
                locks[release.id].released = true
            }

            await this.fetchBatches(userAddress)

            console.log('[Fetched] User Locks', userAddress, locks)
            this.setUserLocksProperty(userAddress, 'data', locks)
            this.setUserLocksProperty(userAddress, 'initialLoad', true)

        } catch (e) {
            log.error(e)
        }
    }

    getBatches(userAddress) {
        return this.batches;
    }

    getLastCompletedBatch() {
        const finalBatch = this.getFinalPeriodIndex()
        const currentBatch = this.getActiveLockingPeriod()

        if (currentBatch <= 0) {
            return -1
        }

        if (currentBatch > finalBatch) {
            return finalBatch
        }

        return Number(currentBatch) - 1
    }

    newBatch(id) {
        return {
            id,
            userLocked: new Big(0),
            totalLocked: new Big(0),
            userRep: new Big(0),
            totalRep: new Big(0),
            userScore: new Big(0),
            totalScore: new Big(0),
            scores: {},
            isComplete: false
        }
    }

    /* 
        Returns the 'amount locked' within a given locking period
        Scores are calculated from each lock and extend lock event
    */
    async fetchBatches(user) {
        const contract = this.loadContract()
        const batches = {}
        const lockScores = {}
        const locks = this.userLocks

        try {
            const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            for (let event of lockEvents) {
                const lock = await this.parseLockEvent(event)

                let batch = batches[lock.lockingPeriod]
                if (!batch) {
                    batch = this.newBatch(lock.lockingPeriod)
                    batches[lock.lockingPeriod] = batch
                }

                const amount = new Big(lock.amount)

                batch.totalLocked = batch.totalLocked.plus(amount)

                if (lock.locker === user) {
                    batch.userLocked = batch.userLocked.plus(amount)
                }
            }

            const lastCompletedBatch = this.getLastCompletedBatch()
            const currentBatch = this.getActiveLockingPeriod()

            for (let i = 0; i <= lastCompletedBatch + 1; i++) {
                let batch = batches[i]
                if (!batch) {
                    batch = this.newBatch(i)
                    batches[i] = batch
                }

                // const totalScore = new Big(await contract.methods.batches(i).call())
                const totalRep = new Big(await contract.methods.getRepRewardPerBatch(i).call())

                let userPortion = new Big(0)
                if (!batch.totalLocked.eq(new Big(0))) {
                    userPortion = batch.userLocked.div(batch.totalLocked)
                }
                const userRep = userPortion.mul(totalRep)

                batch.totalRep = totalRep
                batch.userRep = userRep

                if (i < currentBatch) {
                    batch.isComplete = true
                }
            }

            Object.keys(batches).forEach(key => {
                const batchId = batches[key].id
                const userLocked = batches[key].userLocked.toString()
                const totalLocked = batches[key].totalLocked.toString()
                const totalRep = batches[key].totalRep.toString()
                const userRep = batches[key].userRep.toString()

                const printBatch = {
                    batchId, userLocked, totalLocked, totalRep, userRep
                }

                console.log('batch', printBatch)
            })

            this.batchesLoaded = true
            this.batches = batches
        } catch (e) {
            log.error(e)
        }
    }

    lock = async (amount, duration, batchId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        log.error(
            '[Action] Lock',
            `amount: ${amount} \n duration: ${duration} \n batchId:${batchId} \n agreementHash: ${AGREEMENT_HASH}`)

        this.setLockActionPending(true)
        try {
            await contract.methods.lock(amount, duration, batchId, AGREEMENT_HASH).send()
            this.fetchUserLocks(userAddress)
            this.setLockActionPending(false)
        } catch (e) {
            log.error(e)
            this.fetchUserLocks(userAddress)
            this.setLockActionPending(false)
        }

    }

    extendLock = async (lockId, periodsToExtend, batchId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.setExtendLockActionPending(lockId, true)
        log.info('extendLock', lockId, periodsToExtend, batchId)

        try {
            await contract.methods.extendLocking(periodsToExtend, batchId, lockId, AGREEMENT_HASH).send()
            await this.fetchUserLocks(userAddress)
            this.setExtendLockActionPending(lockId, false)
        } catch (e) {
            log.error(e)
            await this.fetchUserLocks(userAddress)
            this.setExtendLockActionPending(lockId, false)
        }

    }

    release = async (beneficiary, lockId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.setReleaseActionPending(lockId, true)
        log.info('release', beneficiary, lockId)

        try {
            await contract.methods.release(beneficiary, lockId).send()
            await this.fetchUserLocks(userAddress)
            this.setReleaseActionPending(lockId, false)
        } catch (e) {
            log.error(e)
            await this.fetchUserLocks(userAddress)
            this.setReleaseActionPending(lockId, false)
        }

    }

}