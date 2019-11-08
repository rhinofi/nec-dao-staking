import { observable, action } from 'mobx'
import { RootStore } from './Root'
import BaseStore from './BaseStore'

export default class BidFormStore extends BaseStore {
    @observable bidAmount!: string
    @observable duration!: number
    @observable tokenInput = {
        touched: false,
        error: false,
        errorMessage: ""
    }

    constructor(rootStore) {
        super(rootStore)
        this.resetData()
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

    @action resetData = () => {
        this.bidAmount = ''
        this.duration = 1
        this.tokenInput = {
            touched: false,
            error: false,
            errorMessage: ""
        }
    }
}