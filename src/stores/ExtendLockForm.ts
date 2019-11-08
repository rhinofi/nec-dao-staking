import { observable, action } from 'mobx'
import { RootStore } from './Root';
import BaseStore from './BaseStore';

export default class ExtendLockFormStore extends BaseStore {
    @observable selectedLockId!: string
    @observable isLockSelected!: boolean
    @observable rangeStart!: number
    @observable duration!: number
    @observable isExtendable!: boolean

    constructor(rootStore) {
        super(rootStore)
        this.resetData()
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

    @action resetData = () => {
        this.selectedLockId = ''
        this.isLockSelected = false
        this.rangeStart = 1
        this.duration = 1
        this.isExtendable = false

    }
}