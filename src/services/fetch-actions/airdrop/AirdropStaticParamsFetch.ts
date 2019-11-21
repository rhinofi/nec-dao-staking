import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"

interface Params {
    necRepAllocationContract: any;
    repFromTokenContract: any;
}

export class AirdropStaticParamsFetch extends BaseFetch {
    params: Params;
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'Airdrop Static Params'
        super(contract, fetchText, rootStore, {})
        this.params = params
    }

    async fetchData(): Promise<FetchActionResult> {
        const { necRepAllocationContract, repFromTokenContract } = this.params
        const data = await Promise.all(
            [
                necRepAllocationContract.methods.blockReference().call(),
                necRepAllocationContract.methods.totalTokenSupplyAt().call(),
                necRepAllocationContract.methods.claimingStartTime().call(),
                necRepAllocationContract.methods.claimingEndTime().call(),
                necRepAllocationContract.methods.reputationReward().call(),
                necRepAllocationContract.methods.token().call(),
                repFromTokenContract.methods.getAgreementHash().call()
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
                token: data[5],
                agreementHash: data[6]
            }
        }
    }
}