import dayjs from "dayjs";
import { saveAs } from 'file-saver'
import { parse } from "json2csv";

export interface AdminTableData {
  id: string;
  period: string;
  status: string;
  endDate: string;
  startDate: string;
  unlockDate: string;
  contractAddress: string;
  snapshotDate: string;
  necToDistribute: string;
  necToDistributeWithMultiplier: string
}

interface TableDataDTO {
  id: string;
  week_number: string;
  nec_to_distribute: string;
  start_date: string;
  nec_earned: string;
  closed: boolean;
  fk_period_id: string;
  snapshot_date: string;
  bpt_balance: string;
  contract_address: string;
  unlock_date: string;
  end_date: string;
  nec_to_distribute_with_multiplier: string
}

const getAuthorizationHeader = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`
  }
}

const formatDate = (dateString: string) => {
  return dayjs.utc(dateString).format("YYYY-MM-DD HH:mm:ss");
};

const tableDataMapper = (tableDataDtos: TableDataDTO[]): AdminTableData[] => {
  return tableDataDtos.map((dto) => {
    const {
      week_number,
      nec_to_distribute,
      start_date,
      closed,
      snapshot_date,
      contract_address,
      unlock_date,
      end_date,
      id,
      nec_to_distribute_with_multiplier
    } = dto;
    return {
      period: week_number,
      status: closed ? "Closed" : "Open",
      unlockDate: unlock_date && `UTC ${formatDate(unlock_date)}`,
      contractAddress: contract_address,
      snapshotDate: snapshot_date && `UTC ${formatDate(snapshot_date)}`,
      necToDistribute: nec_to_distribute,
      endDate: end_date && `UTC ${formatDate(end_date)}`,
      startDate: start_date && `UTC ${formatDate(start_date)}`,
      id,
      necToDistributeWithMultiplier: nec_to_distribute_with_multiplier || "0"
    };
  });
};

export const schedulePeriods = async (
  necPerWeek: Record<string, number>,
  weeks: number,
  start_date: dayjs.Dayjs
) => {
  const necs = Object.values(necPerWeek).slice(0, weeks);
  await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/period`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader()
    },
    body: JSON.stringify({
      necPerWeek: necs,
      weeks,
      start_date,
    }),
  });
};

export const takeSnapshot = async (weekId: string) => {
  await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/snapshot/take/${weekId}`, {
    method: "POST",
    headers: getAuthorizationHeader()
  });
}

export const fetchWeeksData = async () => {
  const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/week/all`, {
    headers: getAuthorizationHeader()
  });
  const result = await response.json();

  if (result.error) {
    throw new Error(result.message)
  }

  return tableDataMapper(result)
}

export const publishWeek = async (weekId: string) => {
  await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/snapshot/publish/${weekId}`, {
    method: "POST",
    headers: getAuthorizationHeader()
  });
}

export const deployContract = async (weekId: string) => {
  await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/snapshot/redeploy/${weekId}`, {
    method: "POST",
    headers: getAuthorizationHeader()
  });
}

export const addBeneficiaries = async (weekId: string) => {
  await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/snapshot/addBeneficiaries/${weekId}`, {
    method: "POST",
    headers: getAuthorizationHeader()
  });
}

export const getSnapshotCsv = async (weekId: string) => {
  const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/snapshot/csv/${weekId}`, {
    method: "GET",
    headers: {
      'Content-Type': 'text/csv',
      ...getAuthorizationHeader()
    }
  });

  const result = await response.json()
  const snapshot = parse(result.snapshotData)
  console.log(snapshot)
  const blob = new Blob([snapshot], {type: "text/csv"});
  saveAs(blob, 'snapshot.csv')
}

export const login = async (email: string, password: string) => {
  const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/login`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();

  if (result.error) {
    throw new Error(result.message)
  }

  localStorage.setItem('token', result.token)
}

export const signup = async (email: string, password: string) => {
  const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/signup`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader()
    },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();

  if (result.error) {
    throw new Error(result.message)
  }

  localStorage.setItem('token', result.token)
}

export const addRewardMultiples = async (multiples: any) => {
  const response = await fetch(`${process.env.REACT_APP_SNAPSHOT_API_URL}/reward/multiple`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader()
    },
    body: JSON.stringify({ multiples })
  });
  const result = await response.json();

  if (result.error) {
    throw new Error(result.message)
  }
}