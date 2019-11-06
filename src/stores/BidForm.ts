import { observable, action } from 'mobx'
import { RootStore } from './Root'

export default class BidFormStore {
    @observable bidAmount = ''
    @observable duration = 1
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

    @action setBidAmount(value: string) {
        this.bidAmount = value
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
        this.bidAmount = ''
        this.duration = 1
        this.tokenInput = {
            touched: false,
            error: false,
            errorMessage: ""
        }
    }
}