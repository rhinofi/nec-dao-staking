// Stores
import ProviderStore from "./Provider";
import AirdropStore from "./Airdrop";
import LockNECStore from "./LockNEC";
import BidGENStore from "./BidGEN";
import LockFormStore from "./LockForm"
import BidFormStore from "./BidForm"
import TokenStore from "./Token"
import TimeStore from "./Time"
import * as deployed from 'deployed'

class RootStore {
    constructor() {
        this.providerStore = new ProviderStore(this)
        this.airdropStore = new AirdropStore(this)
        this.lockNECStore = new LockNECStore(this)
        this.bidGENStore = new BidGENStore(this)
        this.lockFormStore = new LockFormStore(this)
        this.bidFormStore = new BidFormStore(this)
        this.tokenStore = new TokenStore(this)
        this.timeStore = new TimeStore(this)
        this.asyncSetup()
    }

    asyncSetup = async () => {
        console.log('start')
        await this.providerStore.setWeb3WebClient()
        console.log('end')
    }

    setClockUpdateInteral = () => {
        this.clockUpdateInterval = setInterval(() => {
            this.timeStore.fetchCurrentTime();
        }, 100);
    }

    setDataUpdateInterval = async (userAddress) => {
        this.blockUpdateInterval = setInterval(async () => {
            this.timeStore.fetchCurrentBlock();
            console.log(`data update for user ${userAddress}`)

            const genTokenAddress = deployed.GenToken
            const auctionSchemeAddress = deployed.Auction4Reputation
            const necTokenAddress = deployed.NectarToken
            const lockSchemeAddress = deployed.ContinuousLocking4Reputation

            if (!this.bidGENStore.isPropertyInitialLoadComplete('staticParams')) {
                await this.bidGENStore.fetchStaticParams()
            }

            await this.tokenStore.fetchBalanceOf(genTokenAddress, userAddress)
            await this.tokenStore.fetchAllowance(genTokenAddress, userAddress, auctionSchemeAddress)
            await this.bidGENStore.fetchAuctionData()

            await this.tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
            await this.tokenStore.fetchAllowance(necTokenAddress, userAddress, lockSchemeAddress)
            await this.lockNECStore.fetchUserLocks(userAddress)

        }, 3000);
    }

    // loadContracts = () => {
    //     if (this.network.network && !this.network.stopIntervals) {
    //         blockchain.resetFilters(true);
    //         if (typeof this.pendingTxInterval !== "undefined") clearInterval(this.pendingTxInterval);
    //         const addrs = settings.chain[this.network.network];
    //         blockchain.loadObject("proxyregistry", addrs.proxyRegistry, "proxyRegistry");
    //         const setUpPromises = [blockchain.getProxy(this.network.defaultAccount)];
    //         Promise.all(setUpPromises).then(r => {
    //             this.system.init();
    //             this.network.stopLoadingAddress();
    //             this.profile.setProxy(r[0]);
    //             this.profile.loadAllowances();
    //             this.setPendingTxInterval();
    //         });
    //     }
    // }
}

const store = new RootStore();
export default store;
