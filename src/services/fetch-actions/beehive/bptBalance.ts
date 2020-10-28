import { BaseFetch, StatusEnum, FetchActionResult } from 'services/fetch-actions/BaseFetch'
import { RootStore } from 'stores/Root'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'

export class BPTBalanceFetch extends BaseFetch {

    public address: string

    constructor(contract, rootStore: RootStore, address: string) {
        const fetchText = 'BPT balance data'
        super(contract, fetchText, rootStore, {})
        this.address = address
    }

    async fetchData(): Promise<FetchActionResult> {

        const data = await this.contract.methods.balanceOf(this.address).call()
        const balance = new BigNumber(data).div(1e18)

        console.log(balance.toString())

        return {
          status: StatusEnum.SUCCESS,
          data: {
              bptBalance: balance.toString()
          }
      }

    }
}