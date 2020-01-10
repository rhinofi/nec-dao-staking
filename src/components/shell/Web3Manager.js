import React, { useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import { observer, inject, useAsObservableSource } from "mobx-react"
import { activeNetworkId } from 'config.json'
import { Wallet} from '../../stores/Provider'

const WalletTypes = {
  1: 'Ledger',
  2: 'MetaMask'
};
// This component must be a child of <App> to have access to the appropriate context
const Web3Manager = inject('root')(observer((props) => {
    const context = useWeb3Context()
    const wallet = props.root.providerStore.wallet
    if (wallet !== Wallet.NONE && WalletTypes[wallet]) {
      context.setConnector(WalletTypes[wallet], { suppressAndThrowErrors: true }).catch(err => context.setError(err))
    }

    if (!context.active && !context.error) {
        //loading
        props.root.providerStore.setState(0)
        return <React.Fragment>{props.children}</React.Fragment>
    } else if (context.error) {
        //error
        console.log('error', context.error)
        props.root.providerStore.setState(1)
        // Return Error Thing
        return <React.Fragment>{props.children}</React.Fragment>
    } else {
        // success
        console.log('success')
        console.log('context', context)


        props.root.providerStore.setState(2)
        if (context.networkId === activeNetworkId) {
            props.root.providerStore.setWeb3WebClient(context, context.library, true)
        }
        else {
            props.root.providerStore.setWeb3WebClient(context, context.library, false)
        }

        return <React.Fragment>
            {props.children}
        </React.Fragment>
    }
}))

export default Web3Manager