import { observable, action, computed } from 'mobx'
import * as helpers from 'utils/helpers'

export default class TimeStore {
    @observable currentTime = 0
    @observable currentBlock = 0

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action fetchCurrentTime = () => {
        this.currentTime = String(Math.round((new Date()).getTime() / 1000))
    }

    @action fetchCurrentBlock = async () => {
        this.currentBlock = await helpers.getCurrentBlock()
    }
}