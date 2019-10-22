/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import Big from 'big.js/big.mjs';
import * as log from 'loglevel'

const objectPath = require("object-path")

const REDEEM_EVENT = 'Redeem'

export const statusCodes = {
    NOT_LOADED: 0,
    PENDING: 1,
    ERROR: 2,
    SUCCESS: 3
}

const text = {
    staticParamsNotLoaded: 'Static params must be loaded before calling this function'
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

    @observable initialLoad = {
        staticParams: false
    }

    @observable redeemAction = false

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    setRedeemPending(flag) {
        this.redeemAction = flag
    }

    isRedeemPending() {
        return this.redeemAction
    }

    isAfterSnapshot() {
        const snapshotBlock = Number(this.staticParams.snapshotBlock)
        const currentBlock = Number(this.rootStore.timeStore.currentBlock)

        return (currentBlock >= snapshotBlock ? true : false)
    }

    getBlocksPastSnapshot() {
        const snapshotBlock = Number(this.staticParams.snapshotBlock)
        const currentBlock = Number(this.rootStore.timeStore.currentBlock)

        return currentBlock - snapshotBlock
    }

    getBlocksUntilSnapshot() {
        const snapshotBlock = Number(this.staticParams.snapshotBlock)
        const currentBlock = Number(this.rootStore.timeStore.currentBlock)

        return snapshotBlock - currentBlock
    }

    isClaimPeriodStarted() {
        const now = this.rootStore.timeStore.currentTime
        const startTime = this.staticParams.claimStartTime

        return (now > startTime ? true : false)
    }

    isClaimPeriodEnded() {
        const now = this.rootStore.timeStore.currentTime
        const endTime = this.staticParams.claimEndTime

        return (now > endTime ? true : false)
    }

    setInitialLoad(propertyName, flag) {
        objectPath.set(this.initialLoad, `${propertyName}`, flag)
    }

    isUserDataLoaded(userAddress) {
        const loaded = objectPath.get(this.userData, `${userAddress}.initialLoad`) || false

        return loaded
    }

    areStaticParamsLoaded() {
        const loaded = objectPath.get(this.initialLoad, `staticParams`) || false
        return loaded
    }

    getUserData(userAddress) {
        const a = objectPath.get(this.userData, `${userAddress}`)

        return objectPath.get(this.userData, `${userAddress}`)
    }

    setUserData(userAddress, data) {
        objectPath.set(this.userData, `${userAddress}`, data)
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

    getHasRedeemed(userAddress) {
        return this.userData[userAddress].hasReemeed
    }

    fetchStaticParams = async () => {
        const contract = this.loadNecRepAllocationContract()

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

            this.setInitialLoad(propertyNames.STATIC_PARAMS, true)
        } catch (e) {
            console.log(e)
        }
    }

    @action fetchUserData = async (userAddress) => {
        if (!this.areStaticParamsLoaded()) {
            throw new Error(text.staticParamsNotLoaded)
        }


        const contract = this.loadRepFromTokenContract()
        const necRepAllocationContract = this.loadNecRepAllocationContract()
        console.log('[Fetch] User Airdrop Data', userAddress)
        try {
            const redeemEvents = await contract.getPastEvents(REDEEM_EVENT, {
                filter: { _beneficiary: userAddress },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const userBalance = await necRepAllocationContract.methods.balanceOf(userAddress).call()
            const userRep = await necRepAllocationContract.methods.balanceOf(userAddress).call()
            const hasRedeemed = (redeemEvents.length && redeemEvents.length >= 1)

            const data = {
                snapshotBalance: userBalance,
                snapshotRep: userRep,
                hasRedeemed,
                initialLoad: true
            }
            //TODO: filter events for user redemption
            //TODO: calculate REP from (user balance / total supply) * totalREP
            console.log('[Fetched] User Airdrop Data', userAddress, data)

            this.setUserData(userAddress, data)

        } catch (e) {
            log.error(e)
        }
    }

    @action redeem = async (beneficiary) => {
        const contract = this.loadRepFromTokenContract()

        console.log('redeem', beneficiary)
        this.setRedeemPending(true)
        try {
            await contract.methods.redeem(beneficiary).send()
            this.fetchUserData(beneficiary)
            this.setRedeemPending(false)
        } catch (e) {
            log.error(e)
            this.fetchUserData(beneficiary)
            this.setRedeemPending(false)
        }

    }
}