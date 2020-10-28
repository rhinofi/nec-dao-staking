import { BaseFetch, FetchActionResult, StatusEnum } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'

export class PoolDataFetch extends BaseFetch {

    constructor(contract, rootStore: RootStore) {
        const fetchText = 'Pool Data'
        super(contract, fetchText, rootStore, {})
    }

    async fetchData(): Promise<FetchActionResult> {

        const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/pool/apy`)
        const dataResponse = await response.json()

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