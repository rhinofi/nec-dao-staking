/* eslint-disable class-methods-use-this */
import { observable, action, computed } from 'mobx'
import { deployed } from "config.json";
import * as helpers from "utils/helpers"
import * as log from 'loglevel';
import { RootStore } from './Root';
import BigNumber from 'bignumber.js';
const objectPath = require("object-path")

type Address = string
type Key = string

const fetch = {
    balanceOf: '[Fetch] Balance Of',
    allowance: '[Fetch] Allowance',
}

const error = {
    balanceOf: '[Error] Balance Of',
    allowance: '[Error] Allowance',
}

const complete = {
    balanceOf: '[Complete] Balance Of',
    allowance: '[Complete] Allowance',
}

const defaultAsyncActions = {
    approve: {}
}

export default class TokenStore {
    @observable symbols = new Map<Key, string>()
    @observable balances = new Map<Key, BigNumber>()
    @observable allowances = new Map<Key, BigNumber>()

    @observable asyncActions = {
        approve: {}
    }

    rootStore: RootStore

    constructor(rootStore) {
        this.rootStore = rootStore
    }

    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setApprovePending(token, owner, spender, flag) {
        objectPath.set(this.asyncActions, `approve.${token}.${owner}.${spender}`, flag)
        this.asyncActions.approve[token][owner][spender] = flag
    }

    isApprovePending(token, owner, spender) {
        return objectPath.get(this.asyncActions, `approve.${token}.${owner}.${spender}`) || false
    }

    loadContract(tokenAddress) {
        return this.rootStore.providerStore.loadObject('TestToken', tokenAddress, 'TestToken')
    }

    calcMaxApprovalFlag(allowance: BigNumber): boolean {
        return allowance.gt(helpers.MAX_APPROVAL_THRESHOLD)
    }

    hasMaxApproval(tokenAddress: Address, owner: Address, spender: Address): boolean {
        const key = `${tokenAddress}-${owner}-${spender}`
        const allowance = this.allowances.get(key)

        if (!allowance) {
            return false
        }
        if (this.calcMaxApprovalFlag(allowance)) {
            return true
        }
        return false
    }

    getSymbol(tokenAddress: string): string {
        const symbol = this.symbols.get(tokenAddress)
        if (!symbol) {
            throw new Error('Attempt to get non-existent data')
        }
        return symbol
    }

    setAllowanceProperty(tokenAddress: Address, owner: Address, spender: Address, amount: BigNumber) {
        const key = `${tokenAddress}-${owner}-${spender}`
        this.allowances.set(key, amount)
    }

    setBalanceProperty(tokenAddress: Address, account: Address, balance: BigNumber) {
        const key = `${tokenAddress}-${account}`
        this.balances.set(key, balance)
    }

    hasBalance(tokenAddress, account) {
        const key = `${tokenAddress}-${account}`
        const balance = this.balances.get(key)
        if (balance) {
            return true
        }
        return false
    }

    hasAllowance(tokenAddress, owner, spender) {
        const key = `${tokenAddress}-${owner}-${spender}`
        const allowance = this.allowances.get(key)
        if (allowance) {
            return true
        }
        return false
    }

    getBalance(tokenAddress: string, account: string): BigNumber {
        const key = `${tokenAddress}-${account}`
        const balance = this.balances.get(key)
        if (!balance) {
            throw new Error('Accessing non-existent data')
        }
        return balance
    }

    @action approveMax = async (tokenAddress, spender) => {
        const token = this.loadContract(tokenAddress)
        const account = await this.rootStore.providerStore.getDefaultAccount()
        this.setApprovePending(tokenAddress, account, spender, true)

        try {

            await token.methods.approve(spender, helpers.MAX_UINT).send()
            await this.fetchAllowance(tokenAddress, account, spender)
            this.setApprovePending(tokenAddress, account, spender, false)

        } catch (e) {
            log.error(e)
            this.setApprovePending(tokenAddress, account, spender, false)
        }
    }

    @action revokeApproval = async (tokenAddress, spender) => {
        const token = this.loadContract(tokenAddress)
        const account = await this.rootStore.providerStore.getDefaultAccount()
        this.setApprovePending(tokenAddress, account, spender, true)

        try {

            await token.methods.approve(spender, 0).send()
            await this.fetchAllowance(tokenAddress, account, spender)
            this.setApprovePending(tokenAddress, account, spender, false)
        } catch (e) {
            log.error(e)
            this.setApprovePending(tokenAddress, account, spender, false)
        }
    }

    @action fetchSymbol = async (tokenAddress) => {
        log.debug('[Fetch] Symbol', tokenAddress)
        const token = this.loadContract(tokenAddress)
        const symbol = await token.methods.symbol().call()
        this.symbols.set(tokenAddress, symbol)
        log.debug('[Complete] Symbol', tokenAddress, symbol)
    }

    @action fetchBalanceOf = async (tokenAddress, account) => {
        log.debug('[Fetch] Balance Of', tokenAddress, account)
        const token = this.loadContract(tokenAddress)
        const balance = await token.methods.balanceOf(account).call()
        this.setBalanceProperty(tokenAddress, account, balance)
        log.debug('[Complete] Balance Of', tokenAddress, account, balance)
    }

    @action fetchAllowance = async (tokenAddress, account, spender) => {
        log.debug('[Fetch] Allowance', tokenAddress, account, spender)
        const token = this.loadContract(tokenAddress)

        try {
            const allowance = new BigNumber(await token.methods.allowance(account, spender).call())
            log.debug('[Complete] Allowance', tokenAddress, account, spender, allowance)

            this.setAllowanceProperty(tokenAddress, account, spender, allowance)
        } catch (e) {
            log.error(error.allowance, e)
        }

    }

    getAllowance = (tokenAddress: string, account: string, spender: string): BigNumber => {
        const key = `${tokenAddress}-${account}-${spender}`
        const allowance = this.allowances.get(key)
        if (!allowance) {
            throw new Error("Attempt to get non-existent data")
        }
        return allowance
    }

}