import BigNumber from "utils/bignumber"

export class Lock {
    constructor(
        public locker: string,
        public id: string,
        public amount: BigNumber,
        public periodDuration: number,
        public timeDuration: number,
        public lockingTime: number,
        public lockingPeriod: number,
        public scores: Map<number, BigNumber>,
        public releasable: number,
        public released: boolean
    ) { };
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
    constructor(
        tracked: Map<string, Tx>
    ) { };
}

export class PendingTx {
    constructor(
        public lock: boolean,
        public bid: boolean,
        public snapshotRedeem: boolean,
        public extendLock: Map<string, boolean>,
        public releaseLock: Map<string, boolean>
    ) { };
}

export enum AuctionStatus {
    NOT_STARTED = "Not Started",
    IN_PROGRESS = "In Progress",
    COMPLETE = "Complete"
}

export class Auction {
    constructor(
        public totalBid: BigNumber,
        public bids: Map<string, BigNumber>,
        public status: AuctionStatus,
        public rep: Map<string, BigNumber>
    ) { };
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

export class SnapshotInfo {
    constructor(
        public balance: BigNumber,
        public rep: BigNumber,
        public hasRedeemed: boolean
    ) { }
}

export interface BidStaticParams {
    auctionsStartTime: number;
    auctionsEndTime: number;
    auctionLength: number;
    numAuctions: number;
    redeemEnableTime: number;
    auctionRepReward: BigNumber;
}

export interface LockStaticParams {
    numLockingPeriods: number;
    batchTime: number;
    startTime: number;
    agreementHash: string;
    maxLockingBatches: number;
}

export interface AirdropStaticParams {
    snapshotBlock: number;
    snapshotTotalSupplyAt: BigNumber;
    claimStartTime: number;
    claimEndTime: number;
    totalRepReward: BigNumber;
    token: string;
}