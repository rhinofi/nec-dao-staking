import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import { Lock, LockStaticParams, Batch, newBatch, BatchesMetadata } from 'types'
import BigNumber from 'utils/bignumber'
import * as helpers from 'utils/helpers'
import { printBatch } from 'utils/debug'
const ZERO = helpers.ZERO

type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>
type Batches = Map<number, Batch>
type LocksIncluded = Set<string>

interface Params {
    account: string;
    locks: Locks;
    finalBatch: number;
    currentBatch: number;
    maxLockingBatches: number;
    completedBatchIndex: number;
    existingBatches: Batches;
    isInitialLoadComplete: boolean;
    batchesMetadata: BatchesMetadata;
}

export class AllBatchesFetch extends BaseFetch {
    params: Params;
    staticParams!: LockStaticParams
    batches!: Batches
    locksIncluded!: Set<string>

    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'All Batches'
        super(contract, fetchText, rootStore, params)
        this.params = params
        this.staticParams = this.rootStore.lockNECStore.staticParams
    }

    addUserTotalsFromLocks(userLocks: Locks) {
        userLocks.forEach(lock => {
            const lockBatchId = lock.lockingBatch

            if (!this.locksIncluded.has(lock.id)) {

                if (!this.batches.has(lockBatchId)) {
                    throw new Error(`Batch ${lockBatchId} not received`)
                }
                const batch = this.batches.get(lockBatchId) as Batch
                const updated = this.addLockAmountToBatch(batch, lock.amount)
                this.batches.set(lockBatchId, updated);
                this.addLockScoresToBatches(lock.scores)
                this.locksIncluded.add(lock.id)
            }
        });
    }

    addLockAmountToBatch(batch: Batch, amount: BigNumber): Batch {
        batch.userLocked = batch.userLocked.plus(amount)
        return batch;
    }

    addLockScoresToBatches(scores: Map<number, BigNumber>) {
        scores.forEach((score, key) => {

            if (!this.batches.has(key)) {
                throw new Error(`Batch ${key} not received`)
            }
            const batch = this.batches.get(key) as Batch
            batch.userScore = batch.userScore.plus(score)
            this.batches.set(key, batch)
        })
        return this.batches
    }

    initializeEmptyBatches(startIndex, endIndex) {
        for (let i = startIndex; i <= endIndex; i++) {
            if (!this.batches.has(i)) {
                this.batches.set(i, newBatch(i))
            }
        }
        return this.batches
    }

    // Do the network operations or local operations take more time?
    async fetchData(): Promise<FetchActionResult> {
        const contract = this.contract
        const { locks, finalBatch, currentBatch, maxLockingBatches, completedBatchIndex, existingBatches, isInitialLoadComplete, batchesMetadata } = this.params
        this.batches = existingBatches;
        this.locksIncluded = batchesMetadata.locksIncluded

        let firstBatchToFetch = 0;
        let lastBatchToFetch = Math.min(finalBatch, currentBatch + maxLockingBatches);
        if (isInitialLoadComplete) {
            firstBatchToFetch = completedBatchIndex + 1
        }

        this.initializeEmptyBatches(firstBatchToFetch, finalBatch)
        this.addUserTotalsFromLocks(locks)

        //Make all necessary network calls
        const promises = [] as Array<Promise<any>>;

        for (let i = firstBatchToFetch; i <= lastBatchToFetch; i++) {
            promises.push(contract.methods.getRepRewardPerBatch(i).call())
            promises.push(contract.methods.batches(i).call())
        }

        const data = await Promise.all(promises)

        // console.log(data)

        // For every batch that is not yet completed, and could possibly have a score (i.e. <= 12 batches in the future)
        for (let i = firstBatchToFetch; i <= lastBatchToFetch; i++) {
            let batch = this.batches.get(i) as Batch
            let totalRep = ZERO
            let totalScore = ZERO

            const dataIndex = i - firstBatchToFetch
            totalRep = new BigNumber(data[2 * dataIndex])
            totalScore = new BigNumber(data[2 * dataIndex + 1])

            // Scale conversion for total REP
            totalRep = helpers.fromReal(totalRep)

            // What % of total score does user have for this batch?
            const userPortion = totalScore.eq(ZERO) ? ZERO : helpers.safeDiv(batch.userScore, totalScore)

            const userRep = userPortion.times(totalRep)

            batch.totalRep = totalRep
            batch.userRep = userRep
            batch.totalScore = totalScore

            if (i < currentBatch) {
                batch.isComplete = true
            }

            // printBatch(batch)
            this.batches.set(i, batch)
        }

        const newMetadata: BatchesMetadata = new BatchesMetadata(
            this.locksIncluded
        )

        return {
            status: StatusEnum.SUCCESS,
            data: {
                batches: this.batches,
                batchesMetadata: newMetadata,
                batchesLoaded: true,
                completedBatchIndex: Math.max(currentBatch - 1, 0)
            }
        }
    }
}