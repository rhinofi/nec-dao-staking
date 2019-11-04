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
        //loading
        props.root.providerStore.setState(0)
        return <React.Fragment>{props.children}</React.Fragment>
    } else if (context.error) {
        //error
        console.log('error')
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
            <p>{context.account}</p>
            <p>{context.networkId + ` ` + activeNetworkId}</p>
            {props.children}
        </React.Fragment>
    }
}))

export default Web3Manager