// Stores
import ProviderStore from "./Provider";
import AirdropStore from "./Airdrop";
import LockNECStore from "./LockNEC";
import BidGENStore from "./BidGEN";
import BeehiveStore from './BeehiveStore'
import LockFormStore from "./LockForm"
import BidFormStore from "./BidForm"
import ExtendLockFormStore from "./ExtendLockForm"
import TokenStore from "./Token"
import TimeStore from "./Time"
import TxTracker from "./TxTracker"
import DataFetcher from "./DataFetcher"
import { deployed } from 'config.json'
import BaseStore from "./BaseStore";

export class RootStore {
    public providerStore: ProviderStore
    public airdropStore: AirdropStore
    public lockNECStore: LockNECStore
    public bidGENStore: BidGENStore
    public lockFormStore: LockFormStore
    public bidFormStore: BidFormStore
    public extendLockFormStore: ExtendLockFormStore
    public tokenStore: TokenStore
    public timeStore: TimeStore
    public txTracker: TxTracker
    public beehiveStore: BeehiveStore
    public dataFetcher: DataFetcher
    public dataStores: BaseStore[]

    private dataUpdateInterval: any
    private clockUpdateInterval: any
    private blockUpdateInterval: any

    constructor() {
        this.dataFetcher = new DataFetcher(this)
        this.providerStore = new ProviderStore(this)
        this.airdropStore = new AirdropStore(this)
        this.lockNECStore = new LockNECStore(this)
        this.bidGENStore = new BidGENStore(this)
        this.lockFormStore = new LockFormStore(this)
        this.bidFormStore = new BidFormStore(this)
        this.extendLockFormStore = new ExtendLockFormStore(this)
        this.tokenStore = new TokenStore(this)
        this.timeStore = new TimeStore(this)
        this.txTracker = new TxTracker(this)
        this.beehiveStore = new BeehiveStore(this)

        this.dataStores = [] as BaseStore[]
        this.dataStores.push(this.airdropStore)
        this.dataStores.push(this.lockNECStore)
        this.dataStores.push(this.bidGENStore)
        this.dataStores.push(this.lockFormStore)
        this.dataStores.push(this.bidFormStore)
        this.dataStores.push(this.extendLockFormStore)
        this.dataStores.push(this.tokenStore)
        this.dataStores.push(this.beehiveStore)
    }

    resetDataStores() {
        for (let store of this.dataStores) {
            store.resetData()
        }
    }

    clearClockUpdateInterval = () => {
        if (this.clockUpdateInterval) {
            clearInterval(this.clockUpdateInterval)
        }
    }

    clearBlockUpdateInterval = () => {
        if (this.blockUpdateInterval) {
            clearInterval(this.blockUpdateInterval)
        }
    }

    clearDataUpdateInterval = () => {
        if (this.dataUpdateInterval) {
            clearInterval(this.dataUpdateInterval)
        }

    }

    setClockUpdateInteral = () => {
        this.clockUpdateInterval = setInterval(() => {
            this.timeStore.fetchCurrentTime();

        }, 100);
    }

    setBlockUpdateInteral = () => {
        this.blockUpdateInterval = setInterval(() => {
            this.timeStore.fetchCurrentBlock();
        }, 1000);
    }

    fetchLockingData = async (userAddress) => {
        console.log(`[Fetch] Locking Data for ${userAddress}`)

        const necTokenAddress = deployed.NectarToken
        const lockSchemeAddress = deployed.ContinuousLocking4Reputation

        if (!this.lockNECStore.areStaticParamsLoaded()) {
            await this.lockNECStore.fetchStaticParams()
        }

        await this.tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
        await this.tokenStore.fetchAllowance(necTokenAddress, userAddress, lockSchemeAddress)
        await this.lockNECStore.fetchBatches(userAddress)
        await this.lockNECStore.fetchUserLocks(userAddress)

    }

    fetchAuctionData = async (userAddress) => {
        console.log(`[Fetch] Auction Data for ${userAddress}`)

        const genTokenAddress = deployed.GenToken
        const auctionSchemeAddress = deployed.Auction4Reputation

        if (!this.bidGENStore.areStaticParamsLoaded()) {
            await this.bidGENStore.fetchStaticParams()
        }

        await this.tokenStore.fetchBalanceOf(genTokenAddress, userAddress)
        await this.tokenStore.fetchAllowance(genTokenAddress, userAddress, auctionSchemeAddress)
        await this.bidGENStore.fetchAuctionData()
    }

    fetchAirdropData = async (userAddress) => {
        console.log(`[Fetch] Airdrop Data for ${userAddress}`)

        if (!this.airdropStore.areStaticParamsLoaded()) {
            await this.airdropStore.fetchStaticParams()
        }

        await this.airdropStore.fetchUserData(userAddress)
    }

    setDataUpdateInterval = async (userAddress) => {
        this.dataUpdateInterval = setInterval(async () => {
            this.timeStore.fetchCurrentBlock();
            this.fetchLockingData(userAddress)
            this.fetchAirdropData(userAddress)
            this.fetchAuctionData(userAddress)
        }, 3000);
    }
}

const store = new RootStore();
export default store;
