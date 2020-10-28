import * as log from "loglevel";

import {
  MultipleTableDataDTO,
  NecRewardsDTO,
  PoolDataDTO,
  TableData,
  TradingVolumeDTO
} from "types";
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { action, observable } from "mobx";

import { BPTBalanceFetch } from "services/fetch-actions/beehive/bptBalance";
import BaseStore from "./BaseStore";
import { BeehiveMultipleTableFetch } from "services/fetch-actions/beehive/beehiveMultipleTable";
import { BeehiveTableFetch } from "services/fetch-actions/beehive/beehiveTable";
import { NecRewardsFetch } from "services/fetch-actions/beehive/necRewards";
import { PoolDataFetch } from "services/fetch-actions/beehive/poolData";
import { StatusEnum } from "services/fetch-actions/BaseFetch";
import { TradingVolumeFetch } from "services/fetch-actions/beehive/tradingVolume";

log.setDefaultLevel("warn");

export default class BeehiveStore extends BaseStore {
  @observable tableData: TableData[] = [];
  @observable poolData?: PoolDataDTO;
  @observable necRewards?: NecRewardsDTO;
  @observable bptBalance: string = "0";
  @observable showCountdown: boolean = false;
  @observable tradingVolume: TradingVolumeDTO;
  @observable multipleTableData: MultipleTableDataDTO[] = [];


  private BPTAddress = "0xb21e53d8bd2c81629dd916eead08d338e7fcc201";

  constructor(rootStore) {
    super(rootStore);
    this.resetData();
  }

  resetData() {
    // this.tableData = [] as TableData[]
    // this.poolData = undefined
    // this.necRewards = undefined
  }

  loadContract() {
    return this.rootStore.providerStore.loadObject(
      "TestToken",
      this.BPTAddress
    );
  }

  @action fetchTableData = async (address: string) => {
    const action = new BeehiveTableFetch(null, this.rootStore, address);
    const result = await action.fetch();

    if (result.status === StatusEnum.SUCCESS) {
      this.tableData = result.data;
    }
  };

  @action fetchMultipleTableData = async () => {
    const action = new BeehiveMultipleTableFetch(null, this.rootStore);
    const result = await action.fetchData();

    if (result.status === StatusEnum.SUCCESS) {
      this.multipleTableData = result.data;
    }
  };

  @action fetchBptBalance = async (address: string) => {
    const action = new BPTBalanceFetch(
      this.loadContract(),
      this.rootStore,
      address
    );
    const result = await action.fetch();

    if (result.status === StatusEnum.SUCCESS) {
      this.bptBalance = result.data.bptBalance;
    }
  };

  @action fetchPoolData = async () => {
    const action = new PoolDataFetch(null, this.rootStore);
    const result = await action.fetchData();

    if (result.status === StatusEnum.SUCCESS) {
      this.poolData = result.data;
    }
  };

  @action fetchNecRewardsData = async () => {
    const action = new NecRewardsFetch(null, this.rootStore);
    const result = await action.fetchData();
    console.log(result)

    if (result.status === StatusEnum.SUCCESS) {
      this.necRewards = {
        total_nec: Number(result.data.total_nec),
        remaining_nec: Number(result.data.remaining_nec),
      };
    }
  };

  @action fetchNonUserData = async () => {
    console.log('Fetching')
    await this.fetchNecRewardsData()
    await this.fetchPoolData()

    setInterval(async () => {
      await this.fetchNecRewardsData()
      await this.fetchPoolData()
    }, 30000)
  }

  @action toggleCountdown = (value: boolean) => {
    this.showCountdown = value
  }

  @action fetchTradingVolume = async (address: string) => {
    const action = new TradingVolumeFetch(null, this.rootStore, address);
    const result = await action.fetchData();

    if (result.status === StatusEnum.SUCCESS) {
      this.tradingVolume = result.data;
    }
  };
}
