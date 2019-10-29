import React, { useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import { observer, inject } from "mobx-react"
import { activeNetworkId } from 'config.json'

// This component must be a child of <App> to have access to the appropriate context
const Web3Manager = inject('root')(observer((props) => {
    const context = useWeb3Context()
    // const { providerStore } = root

    useEffect(() => {
        context.setFirstValidConnector(['MetaMask'])
    }, [])

    if (!context.active && !context.error) {
        // loading
        console.log('loading')
        // Return Loading Thing
        return <React.Fragment><p>{context.account}</p></React.Fragment>
    } else if (context.error) {
        //error
        console.log('error')
        // Return Error Thing
        return <React.Fragment><p>{context.error.message}</p></React.Fragment>
    } else {
        // success
        console.log('success')
        console.log('context', context)

        /* This is triggered if the account changes too */
        console.log('context.networkId', context.networkId)

        // Return Window OR wrong network
        if (context.networkId === activeNetworkId) {
            props.root.providerStore.setWeb3WebClient(context.library, true)
            return <React.Fragment><p>{context.account}</p>{props.children}</React.Fragment>
        } else {
            props.root.providerStore.setWeb3WebClient(context.library, false)
            return <React.Fragment><p>{context.account}</p><p>{`You're on the wrong network, on ${context.networkId} should be on ${activeNetworkId}`}</p></React.Fragment>
        }

    }
}))

export default Web3Manager