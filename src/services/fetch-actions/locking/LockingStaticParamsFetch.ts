import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'

export class LockingStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'LockNEC Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const data = await Promise.all([
            this.contract.methods.batchesIndexCap().call(),
            this.contract.methods.batchTime().call(),
            this.contract.methods.startTime().call(),
            this.contract.methods.maxLockingBatches().call(),
            this.contract.methods.getAgreementHash().call()
        ])
        return {
            status: StatusEnum.SUCCESS,
            data: {
                numLockingBatches: Number(data[0]),
                batchTime: Number(data[1]),
                startTime: Number(data[2]),
                maxLockingBatches: Number(data[3]),
                agreementHash: data[4]
            }
        }
    }
}