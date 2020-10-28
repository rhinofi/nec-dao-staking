import { BaseFetch, FetchActionResult, StatusEnum } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'

export class TradingVolumeFetch extends BaseFetch {
    public address: string;

    constructor(contract, rootStore: RootStore, address: string) {
        const fetchText = 'Trading Volume'
        super(contract, fetchText, rootStore, {})
        this.address = address;
    }

    async fetchData(): Promise<FetchActionResult> {

        const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/pool/tradingVolume/${this.address}`)
        const dataResponse = await response.json()

        console.log(dataResponse)

        if(!dataResponse.error) {
            return {
                status: StatusEnum.SUCCESS,
                data: dataResponse
            }
        }

        return {
            status: StatusEnum.ERROR,
            data: { }
        }
    }
}