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
    locks: Locks;
    finalBatch: number;
    currentBatch: number;
}

export class AllBatchesFetch extends BaseFetch {
    params: Params;
    staticParams!: LockStaticParams
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'User Locks'
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

    async fetchData(): Promise<FetchActionResult> {
        const contract = this.contract
        const { locks, finalBatch, currentBatch } = this.params
        let batches = new Map<number, Batch>()

        // Initialize
        for (let i = 0; i <= finalBatch; i++) {
            batches.set(i, newBatch(i))
        }

        batches = this.addUserTotalsFromLocks(locks, batches)

        const ZERO = new BigNumber(0)

        for (let i = 0; i <= finalBatch; i++) {
            let batch = batches.get(i) as Batch

            let totalRep = ZERO
            let totalScore = ZERO
            if (i < currentBatch + this.staticParams.maxLockingBatches) {
                // const totalScore = new BigNumber(await contract.methods.batches(i).call())
                totalRep = new BigNumber(await contract.methods.getRepRewardPerBatch(i).call())
                totalScore = new BigNumber(await contract.methods.batches(i).call())
                // console.log('totalScore', i, totalScore.toString())
            }

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
                batchesLoaded: true
            }
        }
    }
}