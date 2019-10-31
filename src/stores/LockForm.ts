import { observable, action, computed } from 'mobx'
import { RootStore } from './Root'

export default class LockFormStore {
    @observable amount = ''
    @observable duration = 1
    @observable rangeStart = 1

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action resetForm = () => {
        this.amount = ''
        this.duration = 1
    }
}