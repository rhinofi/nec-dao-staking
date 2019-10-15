import { observable, action, computed } from 'mobx'

export default class LockFormStore {
    @observable amount = ''
    @observable duration = 1

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action resetForm = () => {
        this.amount = ''
        this.duration = 1
    }
}