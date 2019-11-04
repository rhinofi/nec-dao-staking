import { observable, action, computed } from 'mobx'
import { RootStore } from './Root';
import * as log from 'loglevel'
import { logs, errors, prefix } from 'strings'

export default class BaseAsync {
    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }


}