import {
  toChecksumAddress,
  toBuffer,
  toRpcSig,
  addHexPrefix,
} from 'ethereumjs-util'
import Tx from 'ethereumjs-tx'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import Eth from '@ledgerhq/hw-app-eth'
import AddressGenerator from '../utils/address-generator'
import config from '../config'

import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'

export class LedgerProvider extends HookedWalletSubprovider {
  constructor (path, address) {
    super({
      getAccounts: (cb) => cb(null, [this.address]),
      signTransaction: signTransaction(path),
      signPersonalMessage: signMessage(path, 'signPersonalMessage'),
      signMessage: signMessage(path, 'signMessage'),
    })
    this.address = address
    this.path = path
    const self = this
  }
}

export const listAccounts = async (path, start, n) => {
  const transport = await TransportU2F.create()
  const eth = new Eth(transport)
  const accounts = []
  if (path === 'legacy') {
    const root = await eth.getAddress(`44'/60'/0'`, false, true)
    const generator = new AddressGenerator(root)

    for (let i = 0; i < n; i++) {
      accounts.push({
        address: toChecksumAddress(generator.getAddressString(start + i)),
        path: `44'/60'/0'/${start + i}`
      })
    }
  } else if (path === 'live') {
    for (let i = 0; i < n; i++) {
      const currentPath = `44'/60'/${start + i}'/0/0`
      const account = await eth.getAddress(currentPath)
      account.path = currentPath
      accounts.push(account)
    }
  } else {
    const account = await eth.getAddress(path)
    account.path = path
    accounts.push(account)
  }
  return accounts
}

export const signMessage = (ledgerPath, tmp) => async (msgParams, cb) => {
  try {
    const message = toBuffer(msgParams.data).toString('hex')
    const transport = await TransportU2F.create()
    const eth = new Eth(transport)
    const signed = await eth.signPersonalMessage(ledgerPath, message)
    const signature = toRpcSig(signed.v, toBuffer(`0x${signed.r}`), toBuffer(`0x${signed.s}`))
    cb(null, signature)
    return signature
  } catch (e) {
    cb(e)
  }
}

const signTransaction = (ledgerPath) => async (txParams, cb = () => {}) => {
  try {
    const rawTx = {
      ...txParams,
      chainId: config.activeNetworkId,
    }
    const transport = await TransportU2F.create()
    const eth = new Eth(transport)

    const ethTx = new Tx({
      ...rawTx,
      v: Buffer.from([rawTx.chainId]),
      r: toBuffer(0),
      s: toBuffer(0),
    })
    const rsv = await eth.signTransaction(ledgerPath, ethTx.serialize().toString('hex'))
    const signedTx = new Tx({
      ...rawTx,
      r: addHexPrefix(rsv.r),
      s: addHexPrefix(rsv.s),
      v: addHexPrefix(rsv.v),
    })
    cb(null, `0x${signedTx.serialize().toString('hex')}`)
    return `0x${signedTx.serialize().toString('hex')}`
  } catch (e) {
    console.error(e)
    cb(e)
  }
}