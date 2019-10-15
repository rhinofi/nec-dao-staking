/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import abiDecoder from 'abi-decoder'
import Big from 'big.js/big.mjs';

const LOCK_EVENT = 'LockToken'
const RELEASE_EVENT = 'Release'
const EXTEND_LOCKING_EVENT = 'ExtendLocking'
const AGREEMENT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const { BN } = helpers

export const statusCodes = {
    NOT_LOADED: 0,
    PENDING: 1,
    ERROR: 2,
    SUCCESS: 3
}

const defaultLoadingStatus = {
    status: statusCodes.NOT_LOADED,
    initialLoad: false
}

const defaultAsyncActions = {
    lock: false,
    extendLock: false,
    redeem: false
}

const propertyNames = {
    STATIC_PARAMS: 'staticParams',
    USER_LOCKS: 'userLocks',
    AUCTION_DATA: 'auctionData'
}
export default class LockNECStore {
    // Static Parameters
    @observable staticParams = {
        numLockingPeriods: '',
        lockingPeriodLength: '',
        startTime: '',
        agreementHash: ''
    }

    // Dynamic Data
    @observable userLocks = {}
    @observable auctionData = {}

    // Status
    @observable loadingStatus = {
        staticParams: defaultLoadingStatus,
        userLocks: defaultLoadingStatus,
        auctionData: defaultLoadingStatus
    }

    @observable asyncActions = defaultAsyncActions

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    //TODO: Do this when switching accounts in metamask
    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setLoadingStatus(propertyName, status, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                this.loadingStatus[propertyName][userAddress] = {}
            }

            this.loadingStatus[propertyName][userAddress] = {
                ...this.loadingStatus[propertyName],
                status
            }
        } else {
            this.loadingStatus[propertyName] = {
                ...this.loadingStatus[propertyName],
                status
            }
        }
    }

    setInitialLoad(propertyName, initialLoad, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                this.loadingStatus[propertyName][userAddress] = {}
            }

            this.loadingStatus[propertyName][userAddress] = {
                ...this.loadingStatus[propertyName],
                initialLoad
            }
        } else {
            this.loadingStatus[propertyName] = {
                ...this.loadingStatus[propertyName],
                initialLoad
            }
        }
    }

    isPropertyInitialLoadComplete(propertyName, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (this.loadingStatus[propertyName][userAddress]) {
                return this.loadingStatus[propertyName][userAddress].initialLoad
            } else {
                return false
            }

        }
        return this.loadingStatus[propertyName].initialLoad
    }

    getLoadStatus(propertyName, userAddress = null) {
        if (propertyName === propertyNames.USER_LOCKS) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                return false
            }
            return this.loadingStatus[propertyName][userAddress].status
        }
        return this.loadingStatus[propertyName].status
    }

    getLockingPeriodByTimestamp(startTime, batchTime, timestamp) {

        const startTimeBN = new BN(startTime)
        const batchTimeBN = new BN(batchTime)
        const timestampBN = new BN(timestamp)

        const timeElapsedBN = timestampBN.sub(startTimeBN)
        const lockingPeriodBN = timeElapsedBN.div(batchTimeBN)

        return lockingPeriodBN.toString()
    }

    loadContract() {
        return blockchain.loadObject('ContinuousLocking4Reputation', deployed.ContinuousLocking4Reputation, 'ContinuousLocking4Reputation')
    }

    getActiveLockingPeriod() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.startTime)
        const batchTime = new BN(this.staticParams.lockingPeriodLength)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))

        console.log(startTime.toString(), batchTime.toString(), currentTime.toString())

        const timeElapsed = currentTime.sub(startTime)
        const currentLockingPeriod = timeElapsed.div(batchTime)

        return currentLockingPeriod.toString()
    }

    getTimeElapsed() {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const startTime = new BN(this.staticParams.startTime)
        const currentTime = new BN(Math.round((new Date()).getTime() / 1000))

        const timeElapsed = currentTime.sub(startTime)

        return timeElapsed.toString()
    }

    getUserTokenLocks(userAddress) {
        return this.userLocks[userAddress]
    }

    fetchStaticParams = async () => {
        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.PENDING)

        try {
            const numLockingPeriods = contract.methods.batchesIndexCap().call()
            const lockingPeriodLength = contract.methods.batchTime().call()
            const startTime = contract.methods.startTime().call()
            const agreementHash = contract.methods.getAgreementHash().call()

            this.staticParams = {
                numLockingPeriods,
                lockingPeriodLength,
                startTime,
                agreementHash
            }

            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.SUCCESS)
            this.setInitialLoad(propertyNames.STATIC_PARAMS, true)

        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.ERROR)
        }
    }

    @action fetchUserLocks = async (userAddress) => {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const contract = this.loadContract()

        this.setLoadingStatus(propertyNames.USER_LOCKS, statusCodes.PENDING, userAddress)

        try {
            const data = {}
            const userLockIds = []

            const lockEvents = await contract.getPastEvents(LOCK_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const extendEvents = await contract.getPastEvents(EXTEND_LOCKING_EVENT, {
                filter: { _locker: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const releaseEvents = await contract.getPastEvents(RELEASE_EVENT, {
                filter: { _lockingId: userLockIds },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const startTime = this.staticParams.startTime
            const batchTime = this.staticParams.lockingPeriodLength

            // Add Locks
            for (const event of lockEvents) {
                // console.log(event)
                const {
                    _locker, _lockingId, _amount, _period
                } = event.returnValues

                // We need to get locking time from actual locker
                const result = await contract.methods.lockers(userAddress, _lockingId).call()
                console.log(result)

                const lockingPeriod = this.getLockingPeriodByTimestamp(startTime, batchTime, result.lockingTime)
                const lockDuration = new BN(_period).mul(new BN(batchTime))
                const releasable = (new BN(result.lockingTime).add(lockDuration)).toString()

                userLockIds.push(_lockingId)

                data[_lockingId] = {
                    userAddress: _locker,
                    lockId: _lockingId,
                    amount: _amount,
                    duration: _period,
                    lockingPeriod,
                    releasable,
                    released: false
                }
            }

            console.log('lock events', lockEvents)
            console.log('extend events', extendEvents)
            console.log('release events', releaseEvents)

            // Incorporate Extensions
            for (const event of extendEvents) {
                const { _lockingId, _extendPeriod } = event.returnValues
                data[_lockingId].duration = ((new BN(_extendPeriod)).add(new BN(data[_lockingId].duration))).toString()

                // TODO Add locking period
            }

            // Check Released Status
            for (const event of releaseEvents) {
                const { _lockingId } = event.returnValues
                data[_lockingId].released = true
            }

            this.userLocks[userAddress] = data

            this.setInitialLoad(propertyNames.USER_LOCKS, true, userAddress)
            this.setLoadingStatus(propertyNames.USER_LOCKS, statusCodes.SUCCESS, userAddress)

        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.USER_LOCKS, statusCodes.ERROR, userAddress)
        }
    }

    @action getAuctionData = async (userAddress) => {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }
    }

    lock = async (provider, amount, duration, batchId) => {
        const contract = this.loadContract()

        console.log('lock', amount, duration, batchId, AGREEMENT_HASH)
        try {
            await contract.methods.lock(amount, duration, batchId, AGREEMENT_HASH).send()
        } catch (e) {
            console.log(e)
        }

    }

    extendLock = async (lockId, periodsToExtend, batchId) => {
        const contract = this.loadContract()

        console.log('extendLock', lockId, periodsToExtend, batchId)
        try {
            await contract.methods.extendLocking(periodsToExtend, batchId, lockId, AGREEMENT_HASH).send()
        } catch (e) {
            console.log(e)
        }

    }

    release = async (beneficiary, lockId) => {
        const contract = this.loadContract()

        console.log('release', beneficiary, lockId)
        try {
            await contract.methods.release(beneficiary, lockId).send()
        } catch (e) {
            console.log(e)
        }

    }

}