/* eslint-disable class-methods-use-this */
import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as helpers from "utils/helpers"
import * as blockchain from "utils/blockchain"
import * as log from 'loglevel';
const objectPath = require("object-path");

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
    @observable symbols = {}
    @observable balances = {}
    @observable allowances = {}
    @observable hasMaxApproval = {}

    @observable asyncActions = {
        approve: {}
    }

    constructor(rootStore) {
        this.rootStore = rootStore
    }

    resetAsyncActions() {
        this.asyncActions = defaultAsyncActions
    }

    setApprovePending(token, owner, spender, flag) {
        objectPath.set(this.asyncActions, `approve.${token}.${owner}.${spender}`, flag)
        this.asyncActions.approve[token][owner][spender] = flag
        log.info('set', this.asyncActions.approve[token][owner][spender])
    }

    isApprovePending(token, owner, spender) {
        log.info('is', objectPath.get(this.asyncActions, `approve.${token}.${owner}.${spender}`) || false)
        return objectPath.get(this.asyncActions, `approve.${token}.${owner}.${spender}`) || false
    }

    loadContract(tokenAddress) {
        return blockchain.loadObject('TestToken', tokenAddress, 'TestToken')
    }

    calcMaxApprovalFlag(allowance) {
        const amount = new helpers.BN(allowance)
        const max = new helpers.BN(helpers.MAX_UINT)
        return amount.gte(max.div(new helpers.BN(2)))
    }

    getMaxApprovalFlag(tokenAddress, owner, spender) {
        return objectPath.get(this.hasMaxApproval, `${tokenAddress}.${owner}.${spender}`)
    }

    setMaxApprovalFlag(tokenAddress, owner, spender, flag) {
        objectPath.set(this.hasMaxApproval, `${tokenAddress}.${owner}.${spender}`, flag)
    }

    setAllowanceProperty(tokenAddress, owner, spender, amount) {
        objectPath.set(this.allowances, `${tokenAddress}.${owner}.${spender}`, amount)
    }

    setBalanceProperty(tokenAddress, account, balance) {
        objectPath.set(this.balances, `${tokenAddress}.${account}`, balance)
    }

    hasBalance(tokenAddress, account) {
        if (objectPath.get(this.balances, `${tokenAddress}.${account}`)) {
            return true
        } else {
            return false
        }
    }

    hasAllowance(tokenAddress, owner, spender) {
        if (objectPath.get(this.allowances, `${tokenAddress}.${owner}.${spender}`)) {
            return true
        } else {
            return false
        }
    }

    getBalance(tokenAddress, account) {
        return objectPath.get(this.balances, `${tokenAddress}.${account}`)
    }

    @action approveMax = async (tokenAddress, spender) => {
        const token = this.loadContract(tokenAddress)
        const account = await blockchain.getDefaultAccount()
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
        const account = await blockchain.getDefaultAccount()
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
        log.info('[Fetch] Symbol', tokenAddress)
        const token = this.loadContract(tokenAddress)
        const symbol = await token.methods.symbol().call()
        this.symbols[tokenAddress] = symbol
        log.info('[Complete] Symbol', tokenAddress, symbol)
    }

    @action fetchBalanceOf = async (tokenAddress, account) => {
        log.info('[Fetch] Balance Of', tokenAddress, account)
        const token = this.loadContract(tokenAddress)
        const balance = await token.methods.balanceOf(account).call()
        this.setBalanceProperty(tokenAddress, account, balance)
        log.info('[Complete] Balance Of', tokenAddress, account, balance)
    }

    @action fetchAllowance = async (tokenAddress, account, spender) => {
        log.info('[Fetch] Allowance', tokenAddress, account, spender)
        const token = this.loadContract(tokenAddress)

        try {
            const allowance = await token.methods.allowance(account, spender).call()
            const hasMaxApproval = this.calcMaxApprovalFlag(allowance)

            log.info('[Complete] Allowance', tokenAddress, account, spender, allowance, hasMaxApproval)

            this.setAllowanceProperty(tokenAddress, account, spender, allowance)
            this.setMaxApprovalFlag(tokenAddress, account, spender, hasMaxApproval)
        } catch (e) {
            log.error(error.allowance, e)
        }

    }

    getAllowance = (tokenAddress, account, spender) => {
        if (!this.allowances[tokenAddress]) {
            return undefined
        }

        if (!this.allowances[tokenAddress][account]) {
            return undefined
        }

        return this.allowances[tokenAddress][account][spender]
    }

}