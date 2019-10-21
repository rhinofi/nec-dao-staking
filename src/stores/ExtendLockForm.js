import { observable, action, computed } from 'mobx'

export default class ExtendLockFormStore {
    @observable duration = 1

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action resetForm = () => {
        this.duration = 1
    }
}