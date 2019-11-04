import * as log from 'loglevel'
import { logs, errors, prefix } from 'strings'
import { RootStore } from 'stores/Root';

export enum StatusEnum {
    STALE,
    SUCCESS,
    ERROR,
    NO_NEW_DATA
}

export interface FetchActionResult {
    status: StatusEnum;
    data: any;
}

export class BaseFetch {
    contract: any;
    fetchText!: string;
    rootStore: RootStore
    params: object

    constructor(contract, fetchText, rootStore: RootStore, params) {
        this.contract = contract
        this.fetchText = fetchText
        this.rootStore = rootStore
        this.params = params
    }

    async fetchData(): Promise<FetchActionResult> {
        return {
            status: StatusEnum.SUCCESS,
            data: {}
        }
    }

    async fetch(): Promise<FetchActionResult> {
        log.debug(prefix.FETCH_PENDING, this.fetchText)
        const { sessionId, userAddress } = this.getValidationParams()
        if (!this.checkValidation(sessionId, userAddress)) {
            this.logPreValidation(this.fetchText, this.params)
            return {
                status: StatusEnum.STALE,
                data: {}
            }
        }

        let result
        try {
            result = await this.fetchData()
        } catch (e) {
            log.error(prefix.FETCH_ERROR, this.fetchText, this.params)
            log.error(e)
        }

        if (!this.checkValidation(sessionId, userAddress)) {
            this.logPostValidation(this.fetchText, this.params)
            return {
                status: StatusEnum.STALE,
                data: {}
            }
        }

        log.debug(prefix.FETCH_SUCCESS, this.fetchText, this.params)
        return result;
    }

    getValidationParams() {
        const { dataFetcher, providerStore } = this.rootStore
        const sessionId = dataFetcher.getCurrentSessionId()
        const userAddress = providerStore.getDefaultAccount()
        return {
            sessionId,
            userAddress
        }
    }

    logPreValidation(contentTitle: string, content?) {
        log.warn(prefix.FETCH_PENDING, contentTitle, content ? content : {})
    }

    logPostValidation(contentTitle: string, content?) {
        log.warn(prefix.FETCH_STALE, contentTitle, content ? content : {})
    }

    checkValidation(sessionId: number, userAddress: string) {
        const { dataFetcher } = this.rootStore
        if (!dataFetcher.validateFetch(userAddress, sessionId)) {
            return false
        }
        return true
    }

}