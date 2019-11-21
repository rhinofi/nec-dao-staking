import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"

export class AirdropStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'Airdrop Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const data = await Promise.all(
            [
                this.contract.methods.blockReference().call(),
                this.contract.methods.totalTokenSupplyAt().call(),
                this.contract.methods.claimingStartTime().call(),
                this.contract.methods.claimingEndTime().call(),
                this.contract.methods.reputationReward().call(),
                this.contract.methods.token().call()
            ]
        )

        return {
            status: StatusEnum.SUCCESS,
            data: {
                snapshotBlock: Number(data[0]),
                snapshotTotalSupplyAt: new BigNumber(data[1]),
                claimStartTime: Number(data[2]),
                claimEndTime: Number(data[3]),
                totalRepReward: new BigNumber(data[4]),
                token: data[5]
            }
        }
    }
}