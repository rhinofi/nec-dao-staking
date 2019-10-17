import React from 'react'
import {
  HashRouter,
  Switch,
  Route
} from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import 'components/App.scss'
import ReputationBoostrapper from './pages/ReputationBootstrapper'
import * as log from 'loglevel';

const check = {
  defaultAccount: '[Check] Default Account'
}

window.ethereum.on('accountsChanged', async (accounts) => {
  window.location.reload()
})

@inject('root')
@observer

class App extends React.Component {
  async componentWillMount() {
    const { providerStore } = this.props.root
    log.info(check.defaultAccount, providerStore.getDefaultAccount())
    if (!providerStore.getDefaultAccount()) {
      await providerStore.setWeb3WebClient()
      log.info(check.defaultAccount, providerStore.getDefaultAccount())
    }
  }

  render() {
    const { providerStore } = this.props.root
    log.info(check.defaultAccount, providerStore.getDefaultAccount())

    if (!providerStore.defaultAccount) {
      return <div>Loading Provider...</div>
    }

    return (
      <HashRouter>
        <div className="app-shell">
          <Switch>
            <Route path="/">
              <ReputationBoostrapper />
            </Route>
          </Switch>
        </div>
      </HashRouter>
    )
  }

}

export default App
