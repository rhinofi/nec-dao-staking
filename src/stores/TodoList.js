import { observable, autorun } from 'mobx'

export default class TodoStore {
    @observable todos = ['buy A', 'buy B']
    @observable filter = ''

    constructor(rootStore) {
        this.rootStore = rootStore
    }
}