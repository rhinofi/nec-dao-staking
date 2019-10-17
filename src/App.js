import React from 'react';
import { inject, observer } from 'mobx-react'
import {
  HashRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'

import ReputationBootstrapper from 'components/pages/ReputationBootstrapper'

window.ethereum.on('accountsChanged', async (accounts) => {
  window.location.reload()
})

@inject('root')
@observer
class App extends React.Component {
  async componentDidMount() {
    const { providerStore } = this.props.root
    if (!providerStore.defaultAccount) {
      await providerStore.setWeb3WebClient()
    }
  }

  render() {
    const { providerStore } = this.props.root

    if (!providerStore.defaultAccount) {
      return <div>Loading Provider...</div>
    }

    return (
      <div>
        <HashRouter>
          <div>
            <div className="app-shell">
              <ReputationBootstrapper />
            </div>
          </div>
        </HashRouter>
      </div>
    )
  }
}

export default App;
