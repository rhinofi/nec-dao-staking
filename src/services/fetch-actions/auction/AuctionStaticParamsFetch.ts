import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BigNumber from "utils/bignumber"

export class AuctionStaticParamsFetch extends BaseFetch {
    constructor(contract, rootStore: RootStore) {
        const fetchText = 'BidGEN Static Params'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {
        const auctionsStartTime = await this.contract.methods.auctionsStartTime().call()
        const auctionsEndTime = await this.contract.methods.auctionsEndTime().call()
        const auctionLength = await this.contract.methods.auctionPeriod().call()
        const numAuctions = await this.contract.methods.numberOfAuctions().call()
        const redeemEnableTime = await this.contract.methods.redeemEnableTime().call()
        const auctionRepReward = await this.contract.methods.auctionReputationReward().call()

        return {
            status: StatusEnum.SUCCESS,
            data: {
                auctionsStartTime: Number(auctionsStartTime),
                auctionsEndTime: Number(auctionsEndTime),
                auctionLength: Number(auctionLength),
                numAuctions: Number(numAuctions),
                redeemEnableTime: Number(redeemEnableTime),
                auctionRepReward: new BigNumber(auctionRepReward)
            }
        }
    }
}