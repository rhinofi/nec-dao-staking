import { observable, action } from 'mobx'
import { RootStore } from './Root'

export default class TimeStore {
    @observable currentTime = 0
    @observable currentBlock = 0

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action fetchCurrentTime = () => {
        this.currentTime = Math.round((new Date()).getTime() / 1000)
    }

    @action fetchCurrentBlock = async () => {
        this.currentBlock = Number(await this.rootStore.providerStore.getCurrentBlock())
    }
}