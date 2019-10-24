import { observable, action, computed } from 'mobx'
import * as blockchain from 'utils/blockchain'
import * as web3 from 'utils/web3'
import * as log from 'loglevel';

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

export default class ProviderStore {
    @observable provider = false;
    @observable accounts = [];
    @observable defaultAccount = null;

    constructor(rootStore) {
        this.rootStore = rootStore;
        console.log('window', window)
    }

    setNetwork = async () => {
        try {
            log.info(fetchStart.setAccount)
            await this.setAccount();
            log.info(fetchEnd.setAccount)
        } catch (e) {
            log.error(errors.setAccount, e);
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
        this.rootStore.setDataUpdateInterval(account)

        // web3.currentProvider.publicConfigStore.on('update', this.setWeb3WebClient());

    }

    getDefaultAccount = () => {
        return blockchain.getDefaultAccount()
    }

    // Web3 web client
    @action setWeb3WebClient = async () => {
        try {

            log.info(fetchStart.setWeb3WebClient)
            await blockchain.setWebClientProvider();
            await this.setNetwork();
            log.info(fetchEnd.setWeb3WebClient)
        } catch (e) {
            log.error(errors.setWeb3WebClient, e);
        }
    }
}