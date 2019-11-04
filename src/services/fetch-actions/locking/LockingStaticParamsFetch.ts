import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'

export class LockingStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'LockNEC Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const numLockingBatches = await this.contract.methods.batchesIndexCap().call()
        const batchTime = await this.contract.methods.batchTime().call()
        const startTime = await this.contract.methods.startTime().call()
        const maxLockingBatches = await this.contract.methods.maxLockingBatches().call()
        const agreementHash = await this.contract.methods.getAgreementHash().call()

        return {
            status: StatusEnum.SUCCESS,
            data: {
                numLockingBatches: Number(numLockingBatches),
                batchTime: Number(batchTime),
                startTime: Number(startTime),
                agreementHash,
                maxLockingBatches: Number(maxLockingBatches),
            }
        }
    }
}