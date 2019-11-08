import { RootStore } from './Root';
import { observable, action } from 'mobx'

export default class BaseStore {
    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action resetData() {

    }
}