import { observable, action, computed } from 'mobx'

export default class BidFormStore {
    @observable bidAmount = ''
    @observable duration = 1

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action setBidAmount(value) {
        this.bidAmount = value
    }

    @action resetForm = () => {
        this.bidAmount = ''
        this.duration = 1
    }
}