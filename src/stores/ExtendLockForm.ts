import { observable, action } from 'mobx'
import { RootStore } from './Root';

export default class ExtendLockFormStore {
    @observable selectedLockId: string = ''
    @observable isLockSelected = false
    @observable rangeStart = 1
    @observable duration = 1
    @observable isExtendable = false

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action setIsExtendable(flag: boolean) {
        this.isLockSelected = flag
    }

    @action setSelectedLockId(value: string) {
        this.selectedLockId = value
        this.rangeStart = 1
        this.duration = 1
        this.isLockSelected = true
        console.log('rangeStartSet', this.rangeStart)
    }

    @action setRangeStart(value: number) {
        this.rangeStart = value
        console.log('rangeStartSet', this.rangeStart)
    }

    @action setDuration(value: number) {
        this.duration = value
    }

    @action resetForm = () => {
        this.selectedLockId = ''
        this.duration = 1
        this.isLockSelected = false
    }
}