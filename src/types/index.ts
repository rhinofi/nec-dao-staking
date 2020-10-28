import BigNumber from "utils/bignumber";

export class Lock {
  constructor(
    public locker: string,
    public id: string,
    public amount: BigNumber,
    public batchDuration: number,
    public timeDuration: number,
    public lockingTime: number,
    public lockingBatch: number,
    public scores: Map<number, BigNumber>,
    public releasable: number,
    public released: boolean
  ) { }
}
export class BatchesMetadata {
  constructor(public locksIncluded: Set<string>) { }
}

export enum TxType {
  LOCK,
  EXTEND_LOCK,
  RELEASE_LOCK,
  BID,
  SNAPSHOT_REDEEM,
}

interface Tx {
  type: TxType;
  hash: string;
  pending: boolean;
}

export class TxTracker {
  constructor(tracked: Map<string, Tx>) { }
}

export class PendingTx {
  constructor(
    public lock: boolean,
    public bid: boolean,
    public snapshotRedeem: boolean,
    public extendLock: boolean,
    public releaseLock: Map<string, boolean>
  ) { }
}

export enum AuctionStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETE = "Complete",
}

export class Auction {
  constructor(
    public totalBid: BigNumber,
    public bids: Map<string, BigNumber>,
    public status: AuctionStatus,
    public rep: Map<string, BigNumber>
  ) { }
}

export class Batch {
  constructor(
    public id: number,
    public userLocked: BigNumber,
    public totalLocked: BigNumber,
    public userRep: BigNumber,
    public totalRep: BigNumber,
    public userScore: BigNumber,
    public totalScore: BigNumber,
    public isComplete: boolean
  ) { }
}

export function newBatch(id: number): Batch {
  return {
    id,
    userLocked: new BigNumber(0),
    totalLocked: new BigNumber(0),
    userRep: new BigNumber(0),
    totalRep: new BigNumber(0),
    userScore: new BigNumber(0),
    totalScore: new BigNumber(0),
    isComplete: false,
  };
}

export class SnapshotInfo {
  constructor(
    public balance: BigNumber,
    public rep: BigNumber,
    public hasRedeemed: boolean,
    public claimedAmount: BigNumber
  ) { }
}

export interface BidStaticParams {
  auctionsStartTime: number;
  auctionsEndTime: number;
  auctionLength: number;
  numAuctions: number;
  redeemEnableTime: number;
  auctionRepReward: BigNumber;
  agreementHash: string;
}

export interface LockStaticParams {
  numLockingBatches: number;
  batchTime: number;
  startTime: number;
  maxLockingBatches: number;
  agreementHash: string;
}

export interface AirdropStaticParams {
  snapshotBlock: number;
  snapshotTotalSupplyAt: BigNumber;
  claimStartTime: number;
  claimEndTime: number;
  totalRepReward: BigNumber;
  token: string;
  agreementHash: string;
}

export interface TableData {
  period: string;
  status: string;
  snapshot1: string;
  earnedNec: string;
  unlockDate: string;
  contractAddress: string;
  claim: string;
  endDate: string;
  earnedNecPercent: string;
  tradingVolume: string;
  multiplier: string;
}

export interface TableDataDTO {
  week_number: string;
  nec_to_distribute: string;
  start_date: string;
  end_date: string;
  nec_earned: string;
  closed: boolean;
  fk_period_id: string;
  snapshot_date: string;
  bpt_balance: string;
  unlock_date: string;
  contract_address: string;
  trading_volume: string;
  multiplier: string
}

export interface PoolDataDTO {
  totalBpt: number;
  bptPrice: number;
  apy: number;
  necPrice: number;
  necToDistributeInCurrentPeriod: number;
}

export interface NecRewardsDTO {
  remaining_nec: number;
  total_nec: number;
}

declare global {
  interface Window {
    ledgerData: any;
  }
}

export interface TradingVolumeDTO {
  multiplier: number,
  trading_volume: number
}

export interface MultipleTableData {
  multiplier: number,
  lower_limit: number,
}

export interface MultipleTableDataDTO {
  multiplier: number,
  lower_limit: number,
  id: number,
}