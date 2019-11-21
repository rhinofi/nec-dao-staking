import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"

export class AuctionStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'BidGEN Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const data = await Promise.all([
            this.contract.methods.auctionsStartTime().call(),
            this.contract.methods.auctionsEndTime().call(),
            this.contract.methods.auctionPeriod().call(),
            this.contract.methods.numberOfAuctions().call(),
            this.contract.methods.redeemEnableTime().call(),
            this.contract.methods.auctionReputationReward().call()
        ])

        return {
            status: StatusEnum.SUCCESS,
            data: {
                auctionsStartTime: Number(data[0]),
                auctionsEndTime: Number(data[1]),
                auctionLength: Number(data[2]),
                numAuctions: Number(data[3]),
                redeemEnableTime: Number(data[4]),
                auctionRepReward: new BigNumber(data[5])
            }
        }
    }
}

