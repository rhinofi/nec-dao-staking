import React from 'react'
import {
  HashRouter,
  Switch,
  Route
} from 'react-router-dom'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import 'components/App.scss'
import ReputationBoostrapper from './pages/ReputationBootstrapper'
import rootStore from '../stores/Root'

class App extends React.Component {
  render() {
    const { providerStore } = rootStore
    const defaultAccount = providerStore.getDefaultAccount()

    if (!defaultAccount) {
      providerStore.setWeb3WebClient()
      return <div></div>
    }

    return (
      <Provider root={rootStore}>
        <HashRouter>
          <Switch>
            <Route path="/">
              <ReputationBoostrapper />
            </Route>
          </Switch>
        </HashRouter>
      </Provider>
    )
  }

}

export default App
