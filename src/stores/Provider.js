import { observable, action, computed } from 'mobx'
import Promise from "bluebird";
import log from 'loglevel';

const errors = {
    setAccount: 'Set Account Failed',
    setWeb3WebClient: 'Set Web3Client Failed'
}

const fetchStart = {
    setAccount: '[Fetch] Set Account',
    setWeb3WebClient: '[Fetch] Web3Client'
}

const fetchEnd = {
    setAccount: '[Complete] Set Account',
    setWeb3WebClient: '[Complete] Web3Client'
}

// Libraries
const promisify = Promise.promisify;

const schema = {
    BPAuction4Reputationool: require('../abi/Auction4Reputation'),
    ContinuousLocking4Reputation: require('../abi/ContinuousLocking4Reputation'),
    NectarRepAllocation: require('../abi/NectarRepAllocation'),
    Auction4Reputation: require('../abi/Auction4Reputation'),
    ReputationFromToken: require('../abi/ReputationFromToken'),
    MiniMeToken: require('../abi/MiniMeToken'),
    TestToken: require('../abi/TestToken')
}

const objects = {}

export default class ProviderStore {
    @observable web3 = null;
    @observable defaultAccount = '';
    @observable isProviderSet = false;
    @observable isAccountSet = false;
    @observable hasWrongNetworkError = false;

    constructor(rootStore) {
        this.rootStore = rootStore;
        console.log('window', window)
    }

    setIntervals = async () => {
        const userAddress = this.getDefaultAccount()

        if (userAddress == null) {
            this.hasWrongNetworkError = true
            return
        }

        this.hasWrongNetworkError = false

        await this.rootStore.timeStore.fetchCurrentTime()
        await this.rootStore.timeStore.fetchCurrentBlock()

        this.resetData()

        this.rootStore.fetchLockingData(userAddress)
        this.rootStore.fetchAirdropData(userAddress)
        this.rootStore.fetchAuctionData(userAddress)

        this.rootStore.setClockUpdateInteral()
        this.rootStore.setBlockUpdateInteral()
        this.rootStore.setDataUpdateInterval(userAddress)
    }

    clearIntervals = async () => {
        this.rootStore.clearClockUpdateInterval()
        this.rootStore.clearBlockUpdateInterval()
        this.rootStore.clearDataUpdateInterval()
    }

    @action setAccount = async () => {
        const account = await this.getDefaultAccountByIndex(0);
        await this.setDefaultAccount(account);
        this.isAccountSet = true

    }

    getDefaultAccount = () => {
        return this.defaultAccount
    }

    resetData = () => {
        const { lockNECStore, bidGENStore, airdropStore } = this.rootStore
        lockNECStore.resetData()
        bidGENStore.resetData()
        airdropStore.resetData()
    }

    /*  Set a new web3 provider - for now, we only allow injected clients.
        Set the accounts, and reset all polling intervals for fetching data.
    */
    @action setWeb3WebClient = async (provider, setIntervals) => {
        this.web3 = provider
        await this.setAccount()
        this.clearIntervals()
        this.isProviderSet = true

        if (setIntervals) {
            await this.setIntervals()
        }
    }

    getAccounts = () => {
        return promisify(this.web3.eth.getAccounts)();
    }

    loadObject = (type, address, label = null) => {
        const object = new this.web3.eth.Contract(schema[type].abi, address, { from: this.getDefaultAccount() });
        if (label) {
            objects[label] = object;
        }
        return object;
    }

    getDefaultAccount = () => {
        return this.web3.eth.defaultAccount;
    }

    getCurrentProviderName = () => {
        return this.web3.currentProvider.name;
    }

    getDefaultAccountByIndex = index => {
        return new Promise(async (resolve, reject) => {
            try {
                const accounts = await this.getAccounts();
                resolve(accounts[index]);
            } catch (e) {
                reject(new Error(e));
            }
        });
    }

    getCurrentBlock = async () => {
        return await this.web3.eth.getBlockNumber()
    }

    setDefaultAccount = account => {
        this.web3.eth.defaultAccount = account;
        this.defaultAccount = account;
        console.log(`Address ${account} loaded`);
    }

    getNetwork = () => {
        return promisify(this.web3.version.getNetwork)();
    }

    getGasPrice = () => {
        return promisify(this.web3.eth.getGasPrice)();
    }

    estimateGas = (to, data, value, from) => {
        return promisify(this.web3.eth.estimateGas)({ to, data, value, from });
    }

    getTransaction = tx => {
        return promisify(this.web3.eth.getTransaction)(tx);
    }

    getTransactionReceipt = tx => {
        return promisify(this.web3.eth.getTransactionReceipt)(tx);
    }

    getTransactionCount = address => {
        return promisify(this.web3.eth.getTransactionCount)(address, "pending");
    }

    getNode = () => {
        return promisify(this.web3.version.getNode)();
    }

    getBlock = block => {
        return promisify(this.web3.eth.getBlock)(block);
    }
}