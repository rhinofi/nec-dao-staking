// Stores
import { observable, action, computed } from 'mobx'
import { deployed } from 'config.json'
import { RootStore } from './Root';

export default class DataFetcher {
    private dataUpdateInterval: any
    private clockUpdateInterval: any
    @observable lastFetchSuccess = -1
    @observable lastFetchAttempt = -1
    @observable fetchId = 0
    @observable sessionId = 0

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    clearClockUpdateInterval = () => {
        if (this.clockUpdateInterval) {
            clearInterval(this.clockUpdateInterval)
        }
    }

    clearDataUpdateInterval = () => {
        if (this.dataUpdateInterval) {
            clearInterval(this.dataUpdateInterval)
        }

    }

    setClockUpdateInteral = () => {
        this.clockUpdateInterval = setInterval(() => {
            this.rootStore.timeStore.fetchCurrentTime();

        }, 100);
    }

    incrementSessionId() {
        this.sessionId = this.sessionId + 1
    }

    getCurrentFetchId() {
        return this.fetchId
    }

    getCurrentSessionId() {
        return this.sessionId
    }

    getCurrentUserAddress() {
        return this.rootStore.providerStore.getDefaultAccount()
    }

    validateFetch(userAddress: string, sessionId: number) {
        return userAddress === this.getCurrentUserAddress() && sessionId === this.getCurrentSessionId() ? true : false
    }

    fetchLockingData = async (userAddress) => {
        console.log(`[Fetch] Locking Data for ${userAddress}`)
        const { lockNECStore, tokenStore } = this.rootStore

        const necTokenAddress = deployed.NectarToken
        const lockSchemeAddress = deployed.ContinuousLocking4Reputation

        if (!lockNECStore.areStaticParamsLoaded()) {
            await lockNECStore.fetchStaticParams()
        }

        await tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
        await tokenStore.fetchAllowance(necTokenAddress, userAddress, lockSchemeAddress)

        if (lockNECStore.isLockingStarted()) {
            await lockNECStore.fetchBatches(userAddress)
            await lockNECStore.fetchUserLocks(userAddress)
        }
    }

    fetchAuctionData = async (userAddress) => {
        console.log(`[Fetch] Auction Data for ${userAddress}`)
        const { bidGENStore, tokenStore } = this.rootStore

        const genTokenAddress = deployed.GenToken
        const auctionSchemeAddress = deployed.Auction4Reputation

        if (!bidGENStore.areStaticParamsLoaded()) {
            await bidGENStore.fetchStaticParams()
        }

        await tokenStore.fetchBalanceOf(genTokenAddress, userAddress)
        await tokenStore.fetchAllowance(genTokenAddress, userAddress, auctionSchemeAddress)

        if (bidGENStore.haveAuctionsStarted()) {
            await bidGENStore.fetchAuctionData()
        }
    }

    fetchAirdropData = async (userAddress) => {
        console.log(`[Fetch] Airdrop Data for ${userAddress}`)
        const { airdropStore } = this.rootStore

        if (!airdropStore.areStaticParamsLoaded()) {
            await airdropStore.fetchStaticParams()
        }

        await airdropStore.fetchUserData(userAddress)
    }

    fetchData = async (userAddress) => {
        const { timeStore } = this.rootStore
        timeStore.fetchCurrentBlock();
        const currentBlock = timeStore.currentBlock

        if (currentBlock > this.lastFetchAttempt) {
            this.lastFetchAttempt = currentBlock
            try {
                await this.fetchLockingData(userAddress)
                await this.fetchAirdropData(userAddress)
                await this.fetchAuctionData(userAddress)
                this.lastFetchSuccess = currentBlock
            } catch (e) {
                //refetch this block
                this.lastFetchAttempt = -1
            }
        }
    }

    setDataUpdateInterval = async (userAddress) => {
        this.dataUpdateInterval = setInterval(async () => {
            this.fetchData(userAddress)
        }, 1000);
    }
}
