import { observable, action } from 'mobx'
import { RootStore } from './Root'
import BaseStore from './BaseStore'

export default class LockFormStore extends BaseStore {
    @observable amount = ''
    @observable duration = 1
    @observable rangeStart = 1
    @observable tokenInput = {
        touched: false,
        error: false,
        errorMessage: ""
    }

    constructor(rootStore) {
        super(rootStore)
        this.resetData()
    }

    @action setInputTouched(flag: boolean) {
        this.tokenInput.touched = flag
    }

    @action setErrorStatus(flag: boolean) {
        this.tokenInput.error = flag
    }

    @action setErrorMessage(message: string) {
        this.tokenInput.errorMessage = message
    }

    @action resetData = () => {
        this.amount = ''
        this.duration = 1
        this.rangeStart = 1
        this.tokenInput = {
            touched: false,
            error: false,
            errorMessage: ""
        }
    }
}