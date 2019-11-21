import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import { SnapshotInfo } from 'types'
import BigNumber from 'utils/bignumber'
import * as helpers from 'utils/helpers'

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
        const { airdropStore } = this.rootStore
        const contract = this.contract
        const snapshotBlock = airdropStore.staticParams.snapshotBlock

        const data = await Promise.all([
            contract.getPastEvents(REDEEM_EVENT, {
                filter: { _beneficiary: account },
                fromBlock: 0,
                toBlock: 'latest'
            }),
            tokenContract.methods.balanceOfAt(account, snapshotBlock).call(),
            necRepAllocationContract.methods.balanceOf(account).call()
        ])

        const redeemEvents = data[0]
        const snapshotBalance = new BigNumber(data[1])
        const snapshotRep = new BigNumber(data[2])
        const hasRedeemed = (redeemEvents && (redeemEvents.length >= 1))

        let claimedAmount = helpers.ZERO
        if (hasRedeemed) {
            claimedAmount = new BigNumber(redeemEvents[0]._amount)
        }

        const snapshotInfo: SnapshotInfo = new SnapshotInfo(
            snapshotBalance,
            snapshotRep,
            hasRedeemed,
            claimedAmount
        )

        return {
            status: StatusEnum.SUCCESS,
            data: snapshotInfo
        }
    }
}