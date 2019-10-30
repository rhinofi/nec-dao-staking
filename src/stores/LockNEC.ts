/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as helpers from "utils/helpers"
import * as log from 'loglevel'
import { logs, errors, prefix, } from 'strings'
import { deployed } from 'config.json'
import BigNumber from "utils/bignumber"

import { Lock, LockStaticParams, Batch, newBatch } from 'types'
import { RootStore } from './Root'
type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>

const objectPath = require("object-path")
const LOCK_EVENT = 'LockToken'
const RELEASE_EVENT = 'Release'
const EXTEND_LOCKING_EVENT = 'ExtendLocking'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const { BN } = helpers

const defaultAsyncActions = {
    lock: false,
    extendLock: {},
    redeem: {},
    release: {}
}

export default class LockNECStore {
    // Static Parameters
    @observable staticParams!: LockStaticParams
    @observable staticParamsLoaded = false
    // Dynamic Data
    @observable userLocks = new Map<string, Locks>()
    @observable userLocksLoaded = new Map<string, boolean>()
    @observable nextBlockToFetch = 0

    @observable batches = new Map<number, Batch>()
    @observable batchesLoaded = false
    @observable completedBatchIndex = 0

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    resetData() {
        // Static Parameters
        this.staticParams = {} as LockStaticParams
        this.staticParamsLoaded = false
        // Dynamic Data
        this.userLocks = new Map<string, Locks>()
        this.userLocksLoaded = new Map<string, boolean>()
        this.nextBlockToFetch = 0

        this.batches = new Map<number, Batch>()
        this.batchesLoaded = false
        this.completedBatchIndex = 0
    }

    getBatchStartTime(batchIndex: number): number {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.batchTime

        return (startTime + (batchIndex * batchTime))
    }

    getBatchEndTime(batchIndex: number): number {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.batchTime

        const nextIndex = Number(batchIndex) + 1

        return (startTime + (nextIndex * batchTime))
    }

    getTimeUntilNextBatch(): number {
        const currentBatch = this.getActiveLockingBatch()
        const now = this.rootStore.timeStore.currentTime
        const nextBatchStartTime = this.getBatchStartTime(currentBatch + 1)

        return (nextBatchStartTime - now)
    }

    getFinalBatchIndex(): number {
        return (this.staticParams.numLockingBatches - 1)
    }

    isLockingStarted(): boolean {
        const now = this.rootStore.timeStore.currentTime
        const startTime = this.staticParams.startTime
        return (now >= startTime)
    }

    calcMaxDuration(startBatch: number): number {
        const batchesRemaining = this.getBatchesRemaining()
        const maxLockDuration = this.staticParams.maxLockingBatches

        let maxDuration = maxLockDuration

        if (batchesRemaining < maxLockDuration) {
            maxDuration = batchesRemaining
        }

        return maxDuration
    }

    calcMaxExtension(batchDuration: number): number {
        const batchesRemaining = this.getBatchesRemaining()
        const maxLockDuration = this.staticParams.maxLockingBatches

        let maxExtension = maxLockDuration - batchDuration

        if (batchesRemaining < maxLockDuration) {
            maxExtension = batchesRemaining
        }

        return maxExtension
    }

    getLockingEndTime(): number {
        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.batchTime
        const numAuctions = this.staticParams.numLockingBatches

        const endTime = startTime + (batchTime * numAuctions)
        return endTime
    }

    isLockingEnded(): boolean {
        const now = this.rootStore.timeStore.currentTime
        const endTime = this.getLockingEndTime()
        return (now >= endTime)
    }

    calcReleaseableTimestamp(lockingTime: number, duration: number): number {
        const batchLength = this.staticParams.batchTime
        const numBatches = Number(duration)

        const lockLength = batchLength * numBatches
        const endDate = new Date(lockingTime + lockLength)

        return endDate.valueOf()
    }

    areStaticParamsLoaded(): boolean {
        return this.staticParamsLoaded
    }

    isUserLockInitialLoadComplete(userAddress) {
        return this.userLocksLoaded.get(userAddress) || false
    }

    areBatchesLoaded(userAddress) {
        return this.batchesLoaded
    }

    getBatchesRemaining(): number {
        const now = this.rootStore.timeStore.currentTime
        const endTime = this.getLockingEndTime()
        const batchTime = this.staticParams.batchTime

        const remainingTime = endTime - now
        const remainingBatches = Math.trunc(remainingTime / batchTime)

        return remainingBatches
    }

    getLockingBatchByTimestamp(timestamp): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.batchTime
        const timeElapsed = timestamp - startTime
        const lockingBatch = timeElapsed / batchTime


        return Math.trunc(lockingBatch)
    }

    loadContract() {
        return this.rootStore.providerStore.loadObject('ContinuousLocking4Reputation', deployed.ContinuousLocking4Reputation, 'ContinuousLocking4Reputation')
    }

    getActiveLockingBatch(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = this.staticParams.startTime
        const batchTime = this.staticParams.batchTime
        const currentTime = this.rootStore.timeStore.currentTime
        const timeElapsed = currentTime - startTime
        const currentLockingBatch = timeElapsed / batchTime

        return Math.trunc(currentLockingBatch)
    }

    getTimeElapsed(): number {
        if (!this.areStaticParamsLoaded()) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.startTime)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))

        const timeElapsed = currentTime.sub(startTime)

        return timeElapsed.toString()
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        try {
            const numLockingBatches = await contract.methods.batchesIndexCap().call()
            const batchTime = await contract.methods.batchTime().call()
            const startTime = await contract.methods.startTime().call()
            const maxLockingBatches = await contract.methods.maxLockingBatches().call()
            const agreementHash = await contract.methods.getAgreementHash().call()

            this.staticParams = {
                numLockingBatches: Number(numLockingBatches),
                batchTime: Number(batchTime),
                startTime: Number(startTime),
                agreementHash,
                maxLockingBatches: Number(maxLockingBatches),
            }

            this.staticParamsLoaded = true
        } catch (e) {
            log.error(e)
        }
    }

    async parseLockEvent(event): Promise<Lock> {

        const {
            _locker, _lockingId, _amount, _batch
        } = event.returnValues

        const block = await this.rootStore.providerStore.getBlock(event.blockNumber)
        const batchTime = this.staticParams.batchTime
        const batchDuration = Number(_batch)
        const timeDuration = batchDuration * batchTime
        const lockingBatch = this.getLockingBatchByTimestamp(block.timestamp)
        const releasable = Number(block.timestamp) + Number(timeDuration)

        return {
            locker: _locker,
            id: _lockingId,
            amount: _amount,
            batchDuration,
            timeDuration,
            lockingTime: block.timestamp,
            lockingBatch,
            scores: new Map<number, BigNumber>(),
            releasable,
            released: false
        }
    }

    async parseExtendEvent(event) {
        const {
            _locker, _lockingId, _extendBatch
        } = event.returnValues
        const block = await this.rootStore.providerStore.getBlock(event.blockNumber)

        return {
            locker: _locker,
            id: _lockingId,
            extendDuration: Number(_extendBatch),
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
        // const { lockingBatch, duration, amount } = lock
        // const { extendDuration } = extend

        // const extendLockingBatch = this.getLockingBatchByTimestamp(extend.timestamp)

        // const scores = {}

        // // How many batches remain in the original lock duration at the time of this extension?
        // const remainBatches = extendLockingBatch - lockingBatch
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

    calcLockScores(lock): Map<number, BigNumber> {
        const { lockingBatch, duration, amount } = lock
        const batchIndexToLockIn = lockingBatch
        const scores = new Map<number, BigNumber>()

        for (let p = 0; p < duration; p++) {
            const batchId = batchIndexToLockIn + p
            const diff = new BigNumber((duration - p))
            const score = (diff).times(amount);
            scores.set(batchId, score)
        }
        return scores
    }

    userHasLocks(userAddress: string): boolean {
        const userlocks = this.userLocks.get(userAddress)
        if (!userlocks) {
            return false
        }
        return userlocks.size === 0 ? false : true
    }

    getUserTokenLocks(userAddress: string): Locks {
        if (this.userLocks.has(userAddress)) {
            return this.userLocks.get(userAddress) as Locks
        }
        throw new Error("Attempting to get user locks which don't exist")
    }

    updateLockDuration(lock: Lock, batchExtension: number): Lock {
        lock.batchDuration = lock.batchDuration + batchExtension
        lock.timeDuration = lock.timeDuration + (this.staticParams.batchTime * batchExtension)
        return lock
    }

    @action fetchUserLocks = async (userAddress) => {
        if (!this.areStaticParamsLoaded()) {
            await this.fetchStaticParams()
        }

        // Can we get the LOCKING TIME by the blocktime of the TX?

        const contract = this.loadContract()
        log.debug(prefix.FETCH_PENDING, 'User Locks', userAddress)

        try {
            const currentBlock = this.rootStore.timeStore.currentBlock

            if (currentBlock < this.nextBlockToFetch - 1) {
                throw new Error(`Current block ${currentBlock} is less than the last fetched block ${this.nextBlockToFetch}`)
            }

            if (currentBlock === this.nextBlockToFetch - 1) {
                console.log(`Current block is the same as last fetched block, no need to fetch`)
                return
            }

            let locks = new Map<string, Lock>()
            if (this.userLocks.has(userAddress)) {
                locks = this.userLocks.get(userAddress) as Locks
            }

            const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: this.nextBlockToFetch,
                toBlock: currentBlock
            })

            const extendEvents = await contract.getPastEvents(EXTEND_LOCKING_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: this.nextBlockToFetch,
                toBlock: currentBlock
            })

            const releaseEvents = await contract.getPastEvents(RELEASE_EVENT, {
                filter: { _beneficiary: userAddress },
                fromBlock: this.nextBlockToFetch,
                toBlock: currentBlock
            })

            // Add new Locks
            for (const event of lockEvents) {
                const lock = await this.parseLockEvent(event)

                const scores = this.calcLockScores(lock)
                lock.scores = scores
                locks.set(lock.id, lock)
            }

            for (const event of extendEvents) {
                const extend = await this.parseExtendEvent(event)
                // const scores = calcExtendScores(locks[extend.id], extend)

                if (!locks.has(extend.id)) {
                    throw new Error("Trying to extend lock which doesn't exist")
                }

                const updatedLock = this.updateLockDuration(locks.get(extend.id) as Lock, extend.extendDuration)
                locks.set(extend.id, updatedLock)
            }

            for (const event of releaseEvents) {
                const release = await this.parseReleaseEvent(event)
                if (!locks.has(release.id)) {
                    throw new Error("Trying to release a lock which doesn't exist")
                }
                const lock = locks.get(release.id) as Lock

                //If a release event exists for an id, it was released
                lock.released = true
                locks.set(release.id, lock)
            }

            log.debug(prefix.FETCH_SUCCESS, 'User Locks', userAddress, locks)
            this.userLocks.set(userAddress, locks)
            this.nextBlockToFetch = currentBlock + 1
            this.userLocksLoaded.set(userAddress, true)
        } catch (e) {
            log.error(prefix.FETCH_ERROR, 'User Locks', userAddress)
            log.error(e)
        }
    }

    getBatches(userAddress) {
        return this.batches;
    }

    getLastCompletedBatch() {
        const finalBatch = this.getFinalBatchIndex()
        const currentBatch = this.getActiveLockingBatch()

        if (currentBatch <= 0) {
            return -1
        }

        if (currentBatch > finalBatch) {
            return finalBatch
        }

        return Number(currentBatch) - 1
    }

    /* 
        Returns the 'amount locked' within a given locking batch
        Scores are calculated from each lock and extend lock event
    */
    async fetchBatches(user: string) {
        const contract = this.loadContract()
        const batches = new Map<number, Batch>()

        const currentBlock = this.rootStore.timeStore.currentBlock
        const nextBlockToFetch = this.nextBlockToFetch

        /*  We want to only get data up to the most recent user locks fetched
            We also _require_ that that is already fetched, becuase we're dependent on those score calcuations

            How do we get things?

            User Score: 
            Sum up the scores from all the locks, for each batch

            Total Score: 
            Read directly from the contract

            User Locked: 
            Sum up the values from all the locks, for the batch it was locked in only.

            Total Locked:
            We actually can't get this without reading every event that ever happened.... We'll have to estimate it from the total score

            User REP:
            Run a local calculation from the total REP * score / total score

            Total REP:
            Not sure on the calculation here.... I think it's a read

            Is Complete;
            A simple time calcuation.
            We set the 'completedBatchIndex' to the latest one that's complete so we don't fetch old data again.
            Hopefully - we can do the initial load in the background for a while, however, this being the first page shown doesn't bode well for that!

        */

        log.debug(prefix.FETCH_PENDING, 'Batches', user)
        try {

            const lastCompletedBatch = this.getLastCompletedBatch()
            const currentBatch = this.getActiveLockingBatch()

            for (let i = 0; i <= lastCompletedBatch + 1; i++) {
                batches.set(i, newBatch(i))
            }

            const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            for (let event of lockEvents) {
                const lock = await this.parseLockEvent(event)

                let batch = batches.get(lock.lockingBatch) as Batch
                batch.totalLocked = batch.totalLocked.plus(lock.amount)

                if (lock.locker === user) {
                    batch.userLocked = batch.userLocked.plus(lock.amount)
                }
            }

            for (let i = 0; i <= lastCompletedBatch + 1; i++) {
                let batch = batches.get(i) as Batch

                // const totalScore = new BigNumber(await contract.methods.batches(i).call())
                const totalRep = new BigNumber(await contract.methods.getRepRewardPerBatch(i).call())

                let userPortion = new BigNumber(0)
                if (!batch.totalLocked.eq(new BigNumber(0))) {
                    userPortion = batch.userLocked.div(batch.totalLocked)
                }
                const userRep = userPortion.times(totalRep)

                batch.totalRep = totalRep
                batch.userRep = userRep

                if (i < currentBatch) {
                    batch.isComplete = true
                }

                batches.set(i, batch)
            }

            // Object.keys(batches).forEach(key => {
            //     const batchId = batches[key].id
            //     const userLocked = batches[key].userLocked.toString()
            //     const totalLocked = batches[key].totalLocked.toString()
            //     const totalRep = batches[key].totalRep.toString()
            //     const userRep = batches[key].userRep.toString()

            //     const printBatch = {
            //         batchId, userLocked, totalLocked, totalRep, userRep
            //     }

            //     console.log('batch', printBatch)
            // })

            this.batchesLoaded = true
            this.batches = batches

            // console.log('batches', batches)

            log.debug(prefix.FETCH_SUCCESS, 'Batches', user)
        } catch (e) {
            log.error(prefix.FETCH_ERROR, 'Batches', user)
            log.error(e)
        }
    }

    lock = async (amount, duration, batchId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        log.error(
            '[Action] Lock',
            `amount: ${amount} \n duration: ${duration} \n batchId:${batchId} \n agreementHash: ${AGREEMENT_HASH}`)

        this.rootStore.txTracker.setLockActionPending(true)
        try {
            await contract.methods.lock(amount, duration, batchId, AGREEMENT_HASH).send()
            this.fetchUserLocks(userAddress)
            this.rootStore.txTracker.setLockActionPending(false)
        } catch (e) {
            log.error(e)
            this.rootStore.txTracker.setLockActionPending(false)
        }

    }

    extendLock = async (lockId, batchesToExtend, batchId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.rootStore.txTracker.setExtendLockActionPending(true)
        log.error('extendLock', lockId, batchesToExtend, batchId)

        try {
            await contract.methods.extendLocking(batchesToExtend, batchId, lockId, AGREEMENT_HASH).send()
            await this.fetchUserLocks(userAddress)
            this.rootStore.txTracker.setExtendLockActionPending(false)
        } catch (e) {
            log.error(e)
            this.rootStore.txTracker.setExtendLockActionPending(false)
        }

    }

    release = async (beneficiary, lockId) => {
        const contract = this.loadContract()
        const userAddress = this.rootStore.providerStore.getDefaultAccount()
        this.rootStore.txTracker.setReleaseActionPending(lockId, true)
        log.debug('release', beneficiary, lockId)

        try {
            await contract.methods.release(beneficiary, lockId).send()
            await this.fetchUserLocks(userAddress)
            this.rootStore.txTracker.setReleaseActionPending(lockId, false)
        } catch (e) {
            log.error(e)
            this.rootStore.txTracker.setReleaseActionPending(lockId, false)
        }

    }

}