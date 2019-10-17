import { observable, action, computed } from 'mobx'
import * as blockchain from '../utils/blockchain'
import TimeStore from './Time';

export default class ProviderStore {
    @observable provider = false;
    @observable accounts = [];
    @observable defaultAccount = null;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    setNetwork = async () => {
        try {
            await this.setAccount();
        } catch (e) {
            console.log(e);
        }
    }

    setAccount = async () => {
        const accounts = await blockchain.getAccounts()
        const account = await blockchain.getDefaultAccountByIndex(0);
        await blockchain.setDefaultAccount(account);

        this.accounts = accounts
        this.defaultAccount = account

        await this.rootStore.timeStore.fetchCurrentTime()
        await this.rootStore.timeStore.fetchCurrentBlock()

        this.rootStore.setClockUpdateInteral()
        this.rootStore.setBlockUpdateInteral()
    }

    getDefaultAccount = () => {
        return blockchain.getDefaultAccount()
    }

    // Web3 web client
    @action setWeb3WebClient = async () => {
        try {
            await blockchain.setWebClientProvider();
            await this.setNetwork();
        } catch (e) {
            console.log(e);
        }
    }
}