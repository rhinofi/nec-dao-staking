import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import { Lock, LockStaticParams, Batch, newBatch } from 'types'
import BigNumber from 'utils/bignumber'
const LOCK_EVENT = 'LockToken'
const RELEASE_EVENT = 'Release'
const EXTEND_LOCKING_EVENT = 'ExtendLocking'

type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>
type Batches = Map<number, Batch>


interface Params {
    account: string;
}

export class UserLocksFetch extends BaseFetch {
    params: Params;
    staticParams!: LockStaticParams
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'User Locks'
        super(contract, fetchText, rootStore, params)
        this.params = params
        this.staticParams = this.rootStore.lockNECStore.staticParams
    }

    async parseLockEvent(event): Promise<Lock> {

        const {
            _locker, _lockingId, _amount, _period
        } = event.returnValues

        const block = await this.rootStore.providerStore.getBlock(event.blockNumber)
        const batchTime = this.staticParams.batchTime
        const batchDuration = Number(_period)
        const timeDuration = batchDuration * batchTime
        const lockingBatch = this.rootStore.lockNECStore.getLockingBatchByTimestamp(block.timestamp)
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

    calcExtendScores(lock: Lock, extend) {
        const { lockingBatch, amount } = lock
        const { extendDuration } = extend

        const batchIndexToLockIn = this.rootStore.lockNECStore.getLockingBatchByTimestamp(extend.timestamp)

        const scores = lock.scores

        // // How many batches remain in the original lock duration at the time of this extension?
        const remainBatches = batchIndexToLockIn - lockingBatch
        const batchesCountFromCurrent = remainBatches + extendDuration

        // const amount = new BN(lock.amount)
        // const finalBatch = new BN(batchesCountFromCurrent)

        for (let p = 0; p < batchesCountFromCurrent; p++) {
            const batchId = batchIndexToLockIn + p
            const diff = new BigNumber((batchesCountFromCurrent - p))
            const score = diff.times(amount);
            scores.set(batchId, score)
        }
        return scores
    }

    calcLockScores(lock: Lock): Map<number, BigNumber> {
        const { lockingBatch, batchDuration, amount } = lock
        const batchIndexToLockIn = lockingBatch
        const scores = new Map<number, BigNumber>()

        for (let p = 0; p < batchDuration; p++) {
            const batchId = batchIndexToLockIn + p
            const diff = new BigNumber((batchDuration - p))
            const score = (diff).times(amount);
            scores.set(batchId, score)
        }
        return scores
    }

    async parseExtendEvent(event) {
        const {
            _locker, _lockingId, _extendPeriod
        } = event.returnValues
        const block = await this.rootStore.providerStore.getBlock(event.blockNumber)

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

    updateLockDuration(lock: Lock, batchExtension: number): Lock {
        lock.batchDuration = lock.batchDuration + batchExtension
        lock.timeDuration = lock.timeDuration + (this.staticParams.batchTime * batchExtension)
        return lock
    }

    async fetchData(): Promise<FetchActionResult> {
        const { account } = this.params
        const nextBlockToFetch = this.rootStore.lockNECStore.nextBlockToFetch
        const existingLocks = this.rootStore.lockNECStore.userLocks
        const contract = this.contract

        const currentBlock = this.rootStore.timeStore.currentBlock
        const sessionId = this.rootStore.dataFetcher.getCurrentSessionId()

        if (currentBlock < nextBlockToFetch - 1) {
            throw new Error(`Current block ${currentBlock} is less than the last fetched block ${nextBlockToFetch}`)
        }

        if (currentBlock === nextBlockToFetch - 1) {
            console.log(`Current block is the same as last fetched block, no need to fetch`)
            return {
                status: StatusEnum.NO_NEW_DATA,
                data: {}
            }
        }

        let locks = new Map<string, Lock>()
        if (existingLocks.has(account)) {
            locks = existingLocks.get(account) as Locks
        }

        const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
            filter: { _locker: account },
            fromBlock: nextBlockToFetch,
            toBlock: currentBlock
        })

        const extendEvents = await contract.getPastEvents(EXTEND_LOCKING_EVENT, {
            filter: { _locker: account },
            fromBlock: nextBlockToFetch,
            toBlock: currentBlock
        })

        const releaseEvents = await contract.getPastEvents(RELEASE_EVENT, {
            filter: { _beneficiary: account },
            fromBlock: nextBlockToFetch,
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

            const lock = locks.get(extend.id) as Lock

            const scores = this.calcExtendScores(lock, extend)

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

        return {
            status: StatusEnum.SUCCESS,
            data: {
                locks,
                currentBlock,
                userLocksLoaded: true
            }
        }
    }
}