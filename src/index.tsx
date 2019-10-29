import React from 'react';
import ReactDOM from 'react-dom';
import Web3Provider from 'web3-react'
import App from 'components/App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'mobx-react'
import RootStore from './stores/Root'
import Web3 from 'web3'
import { Connectors } from 'web3-react'
const { InjectedConnector, NetworkOnlyConnector } = Connectors

const MetaMask = new InjectedConnector()

const Infura = new NetworkOnlyConnector({
    providerURL: 'https://rinkeby.infura.io/v3/cd282052becb4c26ae80ce3aee65aa0c'
})

const connectors = { MetaMask, Infura }

const Root = (
    <Provider root={RootStore}>
        <Web3Provider connectors={connectors} libraryName="web3.js" web3Api={Web3}>
            <App />
        </Web3Provider>
    </Provider>
)

ReactDOM.render(Root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
