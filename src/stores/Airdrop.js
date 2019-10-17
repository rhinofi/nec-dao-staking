/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import Big from 'big.js/big.mjs';

const REDEEM_EVENT = 'Redeem'

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

const propertyNames = {
    STATIC_PARAMS: 'staticParams',
    USER_DATA: 'userData',
}
export default class AirdropStore {
    // Static Parameters
    @observable staticParams = {
        snapshotBlock: '',
        snapshotTotalSupplyAt: '',
        claimStartTime: '',
        claimEndTime: '',
        totalRepReward: ''
    }

    // Dynamic Data
    @observable userData = {}

    // Status
    @observable loadingStatus = {
        staticParams: defaultLoadingStatus,
        userData: {}
    }

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    setLoadingStatus(propertyName, status, userAddress = null) {
        if (propertyName === propertyNames.USER_DATA) {
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
        if (propertyName === propertyNames.USER_DATA) {
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
        if (propertyName === propertyNames.USER_DATA) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                return false
            }

            return this.loadingStatus[propertyName][userAddress].initialLoad || false
        }
        return this.loadingStatus[propertyName].initialLoad
    }

    getLoadStatus(propertyName, userAddress = null) {
        if (propertyName === propertyNames.USER_DATA) {
            if (!this.loadingStatus[propertyName][userAddress]) {
                return false
            }

            return this.loadingStatus[propertyName][userAddress].status
        }
        return this.loadingStatus[propertyName].status
    }

    loadNecRepAllocationContract() {
        return blockchain.loadObject('NectarRepAllocation', deployed.NectarRepAllocation, 'NectarRepAllocation')
    }

    loadMiniMeTokenContract(tokenAddress) {
        return blockchain.loadObject('MiniMeToken', tokenAddress, 'MiniMeToken')
    }

    loadRepFromTokenContract() {
        return blockchain.loadObject('ReputationFromToken', deployed.ReputationFromToken, 'ReputationFromToken')
    }

    getSnapshotBlock() {
        return this.staticParams.snapshotBlock
    }

    getSnapshotBalance(userAddress) {
        return this.userData[userAddress].snapshotBalance
    }

    getSnapshotRep(userAddress) {
        return this.userData[userAddress].snapshotRep
    }

    getHasReemed(userAddress) {
        return this.userData[userAddress].hasReemeed
    }

    fetchStaticParams = async () => {
        const contract = this.loadNecRepAllocationContract()

        this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.PENDING)

        try {
            const snapshotBlock = await contract.methods.blockReference().call()
            const snapshotTotalSupplyAt = await contract.methods.totalTokenSupplyAt().call()
            const claimStartTime = await contract.methods.claimingStartTime().call()
            const claimEndTime = await contract.methods.claimingEndTime().call()
            const totalRepReward = await contract.methods.reputationReward().call()

            this.staticParams = {
                snapshotBlock,
                snapshotTotalSupplyAt,
                claimStartTime,
                claimEndTime,
                totalRepReward
            }

            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.SUCCESS)
            this.setInitialLoad(propertyNames.STATIC_PARAMS, true)


        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.STATIC_PARAMS, statusCodes.ERROR)
        }
    }

    @action fetchUserData = async (userAddress) => {
        if (!this.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
            throw new Error('Static properties must be loaded before fetching user locks')
        }

        const contract = this.loadRepFromTokenContract()
        const necRepAllocationContract = this.loadNecRepAllocationContract()

        this.setLoadingStatus(propertyNames.USER_DATA, statusCodes.PENDING, userAddress)

        try {
            const redeemEvents = await contract.getPastEvents(REDEEM_EVENT, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            const userBalance = await necRepAllocationContract.methods.balanceOf(userAddress).call()
            const userRep = await necRepAllocationContract.methods.balanceOf(userAddress).call()
            const hasReemeed = false

            //TODO: filter events for user redemption
            //TODO: calculate REP from (user balance / total supply) * totalREP

            this.userData[userAddress] = {
                snapshotBalance: userBalance,
                snapshotRep: userRep,
                hasReemeed
            }
            this.setLoadingStatus(propertyNames.USER_DATA, statusCodes.SUCCESS, userAddress)
            this.setInitialLoad(propertyNames.USER_DATA, true, userAddress)

        } catch (e) {
            console.log(e)
            this.setLoadingStatus(propertyNames.USER_DATA, statusCodes.ERROR, userAddress)
        }
    }

    redeem = async (beneficiary) => {
        const contract = this.loadNecRepAllocationContract()

        console.log('redeem', beneficiary)
        try {
            await contract.methods.redeem(beneficiary).send()
        } catch (e) {
            console.log(e)
        }

    }
}