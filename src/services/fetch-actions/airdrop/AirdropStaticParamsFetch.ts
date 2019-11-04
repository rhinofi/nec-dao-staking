import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"

export class AirdropStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'Airdrop Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const snapshotBlock = Number(await this.contract.methods.blockReference().call())
        const snapshotTotalSupplyAt = new BigNumber(await this.contract.methods.totalTokenSupplyAt().call())
        const claimStartTime = Number(await this.contract.methods.claimingStartTime().call())
        const claimEndTime = Number(await this.contract.methods.claimingEndTime().call())
        const totalRepReward = new BigNumber(await this.contract.methods.reputationReward().call())
        const token = await this.contract.methods.token().call()

        return {
            status: StatusEnum.SUCCESS,
            data: {
                snapshotBlock,
                snapshotTotalSupplyAt,
                claimStartTime,
                claimEndTime,
                totalRepReward,
                token
            }
        }
    }
}