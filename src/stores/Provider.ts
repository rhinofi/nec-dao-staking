import { observable, action } from 'mobx'
import Promise from "bluebird";
import Web3 from 'web3';
import { RootStore } from './Root';
import { activeNetworkId } from 'config.json'

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

export enum ProviderState {
    LOADING,
    ERROR,
    SUCCESS
}

export enum Wallet {
    NONE,
    LEDGER,
    METAMASK
}

export default class ProviderStore {
    @observable web3!: Web3;
    @observable context: any
    @observable defaultAccount = '';
    @observable isProviderSet = false;
    @observable isAccountSet = false;
    @observable state: ProviderState = ProviderState.LOADING
    @observable wallet: Wallet = Wallet.NONE

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
        console.log('window', window)
    }

    setIntervals = async () => {
        const { dataFetcher } = this.rootStore
        const userAddress = this.getDefaultAccount()

        dataFetcher.setClockUpdateInteral()
        dataFetcher.setUser(userAddress)
    }

    stopFetching = async () => {
        console.log('No longer fetch data as we don\'t have a valid provider')
        const { dataFetcher } = this.rootStore
        dataFetcher.stopFetching()
    }

    @action setAccount = async () => {
        const account = await this.getDefaultAccountByIndex(0);
        await this.setDefaultAccount(account);
        this.isAccountSet = true

    }

    /*  Set a new web3 provider - for now, we only allow injected clients.
        Set the accounts, and reset all polling intervals for fetching data.
    */
    @action setWeb3WebClient = async (context, provider, correctNetwork) => {
        this.context = context
        this.web3 = provider
        await this.setAccount()
        this.isProviderSet = true

        if (correctNetwork) {
            await this.setIntervals()
        } else {
            await this.stopFetching()
        }
    }

    getState(): ProviderState {
        return this.state
    }

    setState(value: ProviderState) {
        this.state = value
    }

    getWallet(): Wallet {
        return this.wallet
    }

    setWallet(value: Wallet) {
        this.wallet = value
    }

    getAccounts = () => {
        return promisify(this.web3.eth.getAccounts)();
    }

    loadObject = (type, address, label?) => {
        const object = new this.web3.eth.Contract(schema[type].abi, address, { from: this.getDefaultAccount() });
        if (label) {
            objects[label] = object;
        }
        return object;
    }

    getDefaultAccount = (): string => {
        return this.web3.eth.defaultAccount as string;
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

    providerHasCorrectNetwork() {
        return this.context.networkId === activeNetworkId
    }

    getBlock = block => {
        return promisify(this.web3.eth.getBlock)(block);
    }
}