import { observable, action } from 'mobx'
import { RootStore } from './Root'

export default class LockFormStore {
    @observable amount = ''
    @observable duration = 1
    @observable rangeStart = 1
    @observable tokenInput = {
        touched: false,
        error: false,
        errorMessage: ""
    }

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetForm()
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

    @action resetForm = () => {
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