import dayjs from "dayjs";
import {
  BaseFetch,
  StatusEnum,
  FetchActionResult,
} from "services/fetch-actions/BaseFetch";
import { RootStore } from "stores/Root";
import { TableData, TableDataDTO } from "types";

const tableDataMapper = (tableDataDtos: TableDataDTO[]): TableData[] => {
  return tableDataDtos.map((dto) => {
    const {
      week_number,
      closed,
      bpt_balance,
      nec_earned,
      nec_to_distribute,
      end_date,
      snapshot_date,
      unlock_date,
      contract_address,
      trading_volume,
      multiplier
    } = dto;
    return {
      period: week_number,
      status: closed ? "Closed" : "Open",
      snapshot1: bpt_balance ? Number(bpt_balance).toFixed(3) : "0",
      earnedNec: nec_earned ? Number(nec_earned).toFixed(3) : "0",
      endDate: end_date,
      unlockDate: unlock_date,
      contractAddress: contract_address,
      claim: "Unlock NEC",
      snapshotDate: snapshot_date,
      tradingVolume: trading_volume? Number(trading_volume).toFixed(3): "0",
      multiplier: multiplier? Number(multiplier).toFixed(2): "0",
      earnedNecPercent: nec_earned
        ? (((Number(nec_earned) * 100) / Number(nec_to_distribute)) / Number(multiplier) ).toFixed(2)
        : "0",
    };
  });
};

export class BeehiveTableFetch extends BaseFetch {
  public address: string;

  constructor(contract, rootStore: RootStore, address: string) {
    const fetchText = "Beehive Table data";
    super(contract, fetchText, rootStore, {});
    this.address = address;
  }

  async fetchData(): Promise<FetchActionResult> {
    const response = await fetch(
      `${process.env.REACT_APP_SNAPSHOT_API_URL}/week/rewards/${this.address}`
    );
    const result = await response.json();

    console.log(result, tableDataMapper(result))

    if(!result.error) {
        return {
            status: StatusEnum.SUCCESS,
            data: tableDataMapper(result)
        }
    }

    return {
        status: StatusEnum.ERROR,
        data: []
    }
  }
}
