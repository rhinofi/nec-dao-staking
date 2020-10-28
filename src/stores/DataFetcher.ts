import * as log from 'loglevel';

// Stores
import { action, observable } from 'mobx'

import { RootStore } from './Root';
import { deployed } from 'config.json'

export default class DataFetcher {
    dataUpdateInterval: any
    clockUpdateInterval: any
    @observable isFetching = false
    @observable blockFetchSuccess = -1
    @observable blockFetchAttempt = -1
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

    setClockUpdateInteral = () => {
        this.clockUpdateInterval = setInterval(() => {
            this.rootStore.timeStore.fetchCurrentTime();

        }, 100);
    }

    incrementSessionId() {
        this.sessionId = this.sessionId + 1
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

        if (tokenStore.hasMaxApproval(necTokenAddress, userAddress, lockSchemeAddress)) {
            tokenStore.setApprovePending(necTokenAddress, userAddress, lockSchemeAddress, false)
        }

        if (lockNECStore.isLockingStarted()) {
            await lockNECStore.fetchUserLocks(userAddress)
            await lockNECStore.fetchBatches(userAddress)
        }
    }

    fetchBeehiveData = async (userAddress) => {
        console.log(`[Fetch] Beehive Data for ${userAddress}`)
        const { beehiveStore } = this.rootStore

        await beehiveStore.fetchTradingVolume(userAddress)
        await beehiveStore.fetchTableData(userAddress)
        await beehiveStore.fetchBptBalance(userAddress)
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
        const { airdropStore, tokenStore } = this.rootStore
        const necTokenAddress = deployed.NectarToken

        if (!airdropStore.areStaticParamsLoaded()) {
            await airdropStore.fetchStaticParams()
        }

        await tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
        await airdropStore.fetchUserData(userAddress)
    }

    @action fetchData = async (userAddress) => {
        if (!this.isFetching) return;
        if (!this.validateFetch(userAddress, this.sessionId)) return;

        try {
            const { timeStore } = this.rootStore
            await timeStore.fetchCurrentBlock();
            const currentBlock = timeStore.currentBlock

            if (currentBlock > this.blockFetchAttempt) {
                this.blockFetchAttempt = currentBlock
                this.fetchLockingData(userAddress)
                this.fetchAirdropData(userAddress)
                this.fetchAuctionData(userAddress)
                this.blockFetchSuccess = currentBlock
            }
        } catch (e) {
            log.error('Error fetching user data', { e, userAddress })

        } finally {
            setTimeout(() => this.fetchData(userAddress), 1000)
        }
    }

    @action stopFetching = () => {
        this.isFetching = false
    }

    @action startFetching = () => {
        this.isFetching = true
    }

    @action resetCache = () => {
        this.rootStore.resetDataStores()
    }

    @action setUser(userAddress: string) {
        // Stop fetching data
        this.stopFetching()
        // Change the sessionID
        this.incrementSessionId()
        // Reset cached data
        this.blockFetchAttempt = -1
        this.blockFetchSuccess = -1
        this.resetCache()

        // Re-enable fetching and fetch for new user
        this.startFetching()
        this.fetchData(userAddress)

        this.fetchBeehiveData(userAddress)
        setInterval(() => this.fetchBeehiveData(userAddress), 25000)
    }

}
