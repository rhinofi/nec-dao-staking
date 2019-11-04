import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import { SnapshotInfo } from 'types'

const REDEEM_EVENT = 'Redeem'

interface Params {
    account: string;
    necRepAllocationContract: any;
    tokenContract: any;
}

export class AirdropUserDataFetch extends BaseFetch {
    params: Params;
    constructor(contract, rootStore: RootStore, params: Params) {
        const fetchText = 'Airdrop User Data'
        super(contract, fetchText, rootStore, params)
        this.params = params
    }

    async fetchData(): Promise<FetchActionResult> {
        const { necRepAllocationContract, tokenContract, account } = this.params
        const contract = this.contract
        const snapshotBlock = this.rootStore.airdropStore.staticParams.snapshotBlock

        const redeemEvents = await contract.getPastEvents(REDEEM_EVENT, {
            filter: { _beneficiary: account },
            fromBlock: 0,
            toBlock: 'latest'
        })
        const snapshotBalance = await tokenContract.methods.balanceOfAt(account, snapshotBlock).call()
        const snapshotRep = await necRepAllocationContract.methods.balanceOf(account).call()
        const hasRedeemed = (redeemEvents && (redeemEvents.length >= 1))

        const data: SnapshotInfo = new SnapshotInfo(snapshotBalance, snapshotRep, hasRedeemed)

        return {
            status: StatusEnum.SUCCESS,
            data: data
        }
    }
}