import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import { Lock, LockStaticParams, Batch, newBatch } from 'types'
import BigNumber from 'utils/bignumber'
import * as helpers from 'utils/helpers'

type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>
type Batches = Map<number, Batch>

interface Params {
    account: string;
    locks: Locks;
    finalBatch: number;
    currentBatch: number;
    maxLockingBatches: number;
    completedBatchIndex: number;
}

export class AllBatchesFetch extends BaseFetch {
    params: Params;
    staticParams!: LockStaticParams
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'All Batches'
        super(contract, fetchText, rootStore, params)
        this.params = params
        this.staticParams = this.rootStore.lockNECStore.staticParams
    }

    addUserTotalsFromLocks(locks: Locks, batches: Batches): Batches {
        locks.forEach(lock => {
            const lockBatchId = lock.lockingBatch
            const batch = batches.get(lockBatchId) as Batch
            batch.userLocked = batch.userLocked.plus(lock.amount)
            batches.set(lockBatchId, batch)

            lock.scores.forEach((score, key) => {
                const batch = batches.get(key) as Batch
                batch.userScore = batch.userScore.plus(score)
                batches.set(key, batch)
            })
        });
        return batches
    }

    // Do the network operations or local operations take more time?
    async fetchData(): Promise<FetchActionResult> {
        const contract = this.contract
        const { locks, finalBatch, currentBatch, maxLockingBatches, completedBatchIndex } = this.params
        let batches = new Map<number, Batch>()

        const firstBatchToFetch = completedBatchIndex === 0 ? completedBatchIndex : completedBatchIndex + 1
        const lastBatchToFetch = Math.min(finalBatch, currentBatch + maxLockingBatches)

        for (let i = firstBatchToFetch; i <= finalBatch; i++) {
            let batch = batches.get(i) as Batch
            if (!batch) {
                batches.set(i, newBatch(i))
                batch = batches.get(i) as Batch
            }
        }

        console.log({ batches })

        batches = this.addUserTotalsFromLocks(locks, batches)

        const ZERO = new BigNumber(0)

        const promises = [] as Array<Promise<any>>;

        for (let i = firstBatchToFetch; i < currentBatch + this.staticParams.maxLockingBatches; i++) {
            promises.push(contract.methods.getRepRewardPerBatch(i).call())
            promises.push(contract.methods.batches(i).call())
        }

        const data = await Promise.all(promises)
        for (let i = firstBatchToFetch; i <= lastBatchToFetch; i++) {
            let batch = batches.get(i) as Batch
            let totalRep = ZERO
            let totalScore = ZERO
            if (i < currentBatch + this.staticParams.maxLockingBatches) {
                totalRep = new BigNumber(data[2 * i])
                totalScore = new BigNumber(data[2 * i + 1])
            }

            totalRep = helpers.fromReal(totalRep)

            const userLocked = batch.userLocked
            const userScore = batch.userScore

            let userPortion = ZERO

            if (!userScore.eq(ZERO) && !totalScore.eq(ZERO)) {
                userPortion = userScore.div(totalScore)
            }

            const userRep = userPortion.times(totalRep)

            batch.userLocked = userLocked
            batch.userScore = userScore
            batch.totalRep = totalRep
            batch.userRep = userRep
            batch.totalScore = totalScore

            if (i < currentBatch) {
                batch.isComplete = true
            }

            batches.set(i, batch)
        }

        return {
            status: StatusEnum.SUCCESS,
            data: {
                batches,
                batchesLoaded: true,
                completedBatchIndex: Math.max(currentBatch - 1, 0)
            }
        }
    }
}