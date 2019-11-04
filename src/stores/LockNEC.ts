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
import { ProviderState } from './Provider'
import { LockingStaticParamsFetch } from 'services/fetch-actions/locking/LockingStaticParamsFetch'
import { StatusEnum } from 'services/fetch-actions/BaseFetch'
import { UserLocksFetch } from 'services/fetch-actions/locking/UserLocksFetch'
import { AllBatchesFetch } from 'services/fetch-actions/locking/AllBatchesFetch'
type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>
type Batches = Map<number, Batch>

const objectPath = require("object-path")
const LOCK_EVENT = 'LockToken'
const RELEASE_EVENT = 'Release'
const EXTEND_LOCKING_EVENT = 'ExtendLocking'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const { BN } = helpers
log.setDefaultLevel("warn")

export default class LockNECStore {
    // Static Parameters
    @observable staticParams!: LockStaticParams
    @observable staticParamsLoaded!: boolean
    // Dynamic Data
    @observable userLocks!: Map<string, Locks>
    @observable userLocksLoaded!: Map<string, boolean>
    @observable nextBlockToFetch!: number

    @observable batches!: Map<number, Batch>
    @observable batchesLoaded!: boolean
    @observable completedBatchIndex!: number

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetData()
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

    isReleaseable(timestamp: number, lock: Lock): boolean {
        return timestamp > lock.releasable && !lock.released
    }

    calcMaxDuration(startBatch: number): number {
        const batchesRemaining = this.getBatchesRemaining()
        const maxLockDuration = this.staticParams.maxLockingBatches

        if (batchesRemaining <= 0) {
            return 0
        }

        let maxDuration = maxLockDuration

        if (batchesRemaining < maxLockDuration) {
            maxDuration = batchesRemaining
        }

        return maxDuration
    }

    calcMaxExtension(batchDuration: number): number {
        const batchesRemaining = this.getBatchesRemaining()

        if (batchesRemaining <= 0) {
            return 0
        }

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

    areUserLocksLoaded(userAddress) {
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

        const action = new LockingStaticParamsFetch(contract, this.rootStore)
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS) {
            this.staticParams = result.data
            this.staticParamsLoaded = true
        }
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

    @action fetchUserLocks = async (userAddress) => {
        if (!this.areStaticParamsLoaded()) {
            await this.fetchStaticParams()
        }

        const contract = this.loadContract()
        const action = new UserLocksFetch(contract, this.rootStore, { account: userAddress })
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS || result.status === StatusEnum.NO_NEW_DATA) {
            this.userLocks.set(userAddress, result.data.locks)
            this.nextBlockToFetch = result.data.currentBlock + 1
            this.userLocksLoaded.set(userAddress, result.data.userLocksLoaded)
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

        if (!this.areUserLocksLoaded(user)) {
            throw new Error('User locks must be loaded')
        }

        const locks = this.getUserTokenLocks(user)
        const finalBatch = this.getFinalBatchIndex()
        const currentBatch = this.getActiveLockingBatch()

        const action = new AllBatchesFetch(contract, this.rootStore, { account: user, locks, finalBatch, currentBatch })
        const result = await action.fetch()
        if (result.status === StatusEnum.SUCCESS) {
            this.batches = result.data.batches
            this.batchesLoaded = result.data.batchesLoaded
        }
    }

    lock = async (amount, duration, batchId) => {
        const contract = this.loadContract()
        log.error(
            '[Action] Lock', {
            amount: amount,
            duration: duration,
            batchId: batchId,
            agreementHash: AGREEMENT_HASH
        })

        this.rootStore.txTracker.setLockActionPending(true)
        try {
            await contract.methods.lock(amount, duration, batchId, AGREEMENT_HASH).send()
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
            this.rootStore.txTracker.setReleaseActionPending(lockId, false)
        } catch (e) {
            log.error(e)
            this.rootStore.txTracker.setReleaseActionPending(lockId, false)
        }

    }
}