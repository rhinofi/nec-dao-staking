import { BaseFetch, FetchActionResult, StatusEnum } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'

export class NecRewardsFetch extends BaseFetch {

  constructor(contract, rootStore: RootStore) {
      const fetchText = 'Nec Rewards Data'
      super(contract, fetchText, rootStore, {})
  }

  async fetchData(): Promise<FetchActionResult> {

      const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/reward`)
      const dataResponse = await response.json()
      
      return {
        status: StatusEnum.SUCCESS,
        data: dataResponse
      }
  }
}