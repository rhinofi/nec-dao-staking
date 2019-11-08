/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { observable, action } from 'mobx'
import { deployed } from "config.json"
import * as log from 'loglevel'
import { AirdropStaticParams, SnapshotInfo } from 'types'
import { RootStore } from './Root';
import { prefix } from 'strings'
import BaseAsync from './BaseAsync';
import { AirdropStaticParamsFetch } from 'services/fetch-actions/airdrop/AirdropStaticParamsFetch';
import { StatusEnum } from 'services/fetch-actions/BaseFetch';
import { AirdropUserDataFetch } from 'services/fetch-actions/airdrop/AirdropUserDataFetch';

export default class AirdropStore extends BaseAsync {
    @observable staticParams!: AirdropStaticParams
    @observable staticParamsLoaded = false

    @observable userData = new Map<string, SnapshotInfo>()
    @observable userDataLoaded = new Map<string, boolean>()

    @observable redeemAction = false

    constructor(rootStore: RootStore) {
        super(rootStore)
        this.resetData()
    }

    resetData() {
        this.staticParams = {} as AirdropStaticParams
        this.staticParamsLoaded = false
        this.userData = new Map<string, SnapshotInfo>()
        this.userDataLoaded = new Map<string, boolean>()
        this.redeemAction = false
    }

    setRedeemPending(flag) {
        this.redeemAction = flag
    }

    isRedeemPending() {
        return this.redeemAction
    }

    getSecondsUntilClaimsEnd(): number {
        const now = this.rootStore.timeStore.currentTime
        const remaining = this.staticParams.claimEndTime - now
        if (remaining > 0) {
            return remaining
        } else {
            return 0
        }
    }

    getSecondsUntilClaimsStart(): number {
        const now = this.rootStore.timeStore.currentTime
        const remaining = this.staticParams.claimStartTime - now
        if (remaining > 0) {
            return remaining
        } else {
            return 0
        }
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

    getClaimPeriodStart(): number {
        return this.staticParams.claimStartTime
    }

    getClaimPeriodEnd(): number {
        return this.staticParams.claimEndTime
    }

    isUserDataLoaded(userAddress) {
        return this.userDataLoaded.get(userAddress) || false
    }

    areStaticParamsLoaded() {
        return this.staticParamsLoaded
    }

    getUserData(userAddress: string): SnapshotInfo {
        const data = this.userData.get(userAddress)
        if (!data) {
            throw new Error(`Attempting to get non-existent data for user ${userAddress}`)
        }
        return data
    }

    loadNecRepAllocationContract() {
        return this.rootStore.providerStore.loadObject('NectarRepAllocation', deployed.NectarRepAllocation, 'NectarRepAllocation')
    }

    loadMiniMeTokenContract(tokenAddress) {
        return this.rootStore.providerStore.loadObject('MiniMeToken', tokenAddress, 'MiniMeToken')
    }

    loadRepFromTokenContract() {
        return this.rootStore.providerStore.loadObject('ReputationFromToken', deployed.ReputationFromToken, 'ReputationFromToken')
    }

    getSnapshotBlock(): number {
        return this.staticParams.snapshotBlock
    }

    fetchStaticParams = async () => {
        const contract = this.loadNecRepAllocationContract()

        const action = new AirdropStaticParamsFetch(contract, this.rootStore)
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS) {
            this.staticParams = result.data
            this.staticParamsLoaded = true
        }
    }

    @action fetchUserData = async (userAddress: string) => {
        if (!this.areStaticParamsLoaded()) {
            await this.fetchStaticParams()
        }

        const contract = this.loadRepFromTokenContract()
        const necRepAllocationContract = this.loadNecRepAllocationContract()
        const tokenContract = this.loadMiniMeTokenContract(this.staticParams.token)

        const action = new AirdropUserDataFetch(contract, this.rootStore, {
            account: userAddress,
            necRepAllocationContract,
            tokenContract
        })
        const result = await action.fetch()

        if (result.status === StatusEnum.SUCCESS) {
            this.userData.set(userAddress, result.data)
            this.userDataLoaded.set(userAddress, true)
        }
    }

    @action redeem = async (beneficiary) => {
        const contract = this.loadRepFromTokenContract()

        log.debug(prefix.ACTION_PENDING, 'redeem', beneficiary)
        this.setRedeemPending(true)
        try {
            await contract.methods.redeem(beneficiary).send()
            this.setRedeemPending(false)
            log.debug(prefix.ACTION_SUCCESS, 'redeem', beneficiary)
        } catch (e) {
            log.error(e)
            this.setRedeemPending(false)
            log.debug(prefix.ACTION_ERROR, 'redeem', beneficiary)
        }

    }
}