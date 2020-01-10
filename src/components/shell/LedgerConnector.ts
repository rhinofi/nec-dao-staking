import ProviderEngine from 'web3-provider-engine'
import RPCSubprovider from 'web3-provider-engine/subproviders/rpc'
import SubscriptionSubprovider from 'web3-provider-engine/subproviders/subscriptions'
import {Connectors} from 'web3-react'
import { LedgerProvider } from '../../services/ledgerService'

const {Connector} = Connectors;

declare type Provider = any;


interface SupportedNetworkURLs {
    readonly [propName: string]: string
}

interface LedgerConnectorArguments {
    readonly supportedNetworkURLs: SupportedNetworkURLs
    readonly defaultNetwork: number
    readonly baseDerivationPath?: string
}

const DEFAULT_BASE_DERIVATION_PATH = `44'/60'/0'`;

export default class LedgerConnector extends Connector {
    public readonly supportedNetworkURLs: SupportedNetworkURLs
    public readonly defaultNetwork: number
    public address: string
    private engine: any

    public constructor(kwargs: LedgerConnectorArguments) {
        const {supportedNetworkURLs, defaultNetwork, baseDerivationPath} = kwargs
        const supportedNetworks = Object.keys(supportedNetworkURLs).map((supportedNetworkURL): number =>
            Number(supportedNetworkURL)
        )
        super({supportedNetworks})

        this.supportedNetworkURLs = supportedNetworkURLs
        this.defaultNetwork = defaultNetwork
        this.baseDerivationPath = baseDerivationPath
        this.address = '0x0'
    }

    public async getProvider(networkId?: number): Promise<Provider> {
        // we have to validate here because networkId might not be a key of supportedNetworkURLs
        const networkIdToUse = networkId || this.defaultNetwork
        const derivationPathToUse = window.ledgerData.path || DEFAULT_BASE_DERIVATION_PATH
        this.address = window.ledgerData.address
        super._validateNetworkId(networkIdToUse)

        const ledgerSubprovider = new LedgerProvider(derivationPathToUse, this.address)

        const engine = new ProviderEngine()
        this.engine = engine
        engine.addProvider(ledgerSubprovider)
        engine.addProvider(new SubscriptionSubprovider())
        engine.addProvider(new RPCSubprovider({rpcUrl:this.supportedNetworkURLs[networkIdToUse]}))
        engine.start()

        return engine
    }

    public onDeactivation(): void {
        if (this.engine) {
            this.engine.stop()
        }
    }

    public changeNetwork(networkId: number): void {
        // proactively handle wrong network errors
        try {
            super._validateNetworkId(networkId)

            super._web3ReactUpdateHandler({updateNetworkId: true, networkId})
        } catch (error) {
            super._web3ReactErrorHandler(error)
        }
    }
}
