/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as helpers from "utils/helpers"
import * as log from 'loglevel'
import { logs, errors, prefix, } from 'strings'
import BigNumber from "utils/bignumber"

import { Lock, PendingTx } from 'types'
import { RootStore } from './Root'
type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>

const { BN } = helpers

const defaultAsyncActions = {
    lock: false,
    extendLock: {},
    redeem: {},
    release: {}
}

const defaultPendingTx = new PendingTx(
    false,
    false,
    false,
    false,
    new Map<string, boolean>(),
)

export default class LockNECStore {
    @observable pendingTx: PendingTx = defaultPendingTx

    rootStore: RootStore

    @observable asyncActions = defaultAsyncActions

    @observable releaseActions = {}

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    // Do this when changing accounts
    resetData() {
        this.pendingTx = defaultPendingTx
    }

    // Setting a transaction causes the polling loop to check on it's status for you!
    setLockTx(txHash: string) { }
    setExtendLockTx(txHash: string) { }
    setReleaseLockTx(txHash: string) { }

    setLockActionPending(flag: boolean) {
        this.pendingTx.lock = flag
    }

    setSnapshotRedeemActionPending(flag: boolean) {
        this.pendingTx.snapshotRedeem = flag
    }

    setExtendLockActionPending(flag: boolean) {
        this.pendingTx.extendLock = flag
    }

    setReleaseActionPending(lockId: string, flag: boolean) {
        this.pendingTx.releaseLock.set(lockId, flag)
    }

    isLockActionPending() {
        return this.pendingTx.lock
    }

    isSnapshotRedeemActionPending() {
        return this.pendingTx.snapshotRedeem
    }

    isExtendLockActionPending() {
        return this.pendingTx.extendLock
    }

    isReleaseActionPending(lockId: string) {
        if (this.pendingTx.releaseLock.has(lockId)) {
            return this.pendingTx.releaseLock.get(lockId)
        }
        return false
    }

    setBidActionPending(flag: boolean) {
        this.pendingTx.bid = flag
    }

    isBidActionPending() {
        return this.pendingTx.bid
    }
}