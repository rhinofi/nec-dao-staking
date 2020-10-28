import React from 'react'
import { observer, inject } from 'mobx-react'
import { Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { RootStore } from 'stores/Root';
import ConnectWallet from 'components/common/ConnectWallet'
import ConnectMainNet from 'components/common/ConnectMainNet'
import BeehiveHeader from 'components/pages/Beehive/BeehiveHeader'
import { ProviderState } from 'stores/Provider';
import BeehivePanel from './BeehivePanel';
import BeehiveTable from "./BeehiveTable"
import BeehiveSteps from './BeehiveSteps'

@inject('root')
@observer
class Beehive extends React.Component<any, any> {

  renderWidgetWindow() {
    return (
      <Switch>
        <Route exact path="/panel">
          <BeehivePanel />
        </Route>
        <Route exact path="/">
          <Redirect to="/panel" />
        </Route>
      </Switch>
    )
  }

  renderContents() {
    const { providerStore } = this.props.root as RootStore

    if (providerStore.getState() === ProviderState.LOADING) {
      return <ConnectWallet />
    }

    if (providerStore.getState() === ProviderState.ERROR) {
      return <ConnectWallet />
    }

    if (providerStore.getState() === ProviderState.SUCCESS) {
      if (providerStore.providerHasCorrectNetwork()) {
        return <BeehiveTable />
      } else {
        return <ConnectWallet warning={true} />
      }
    }
  }

  render() {
    return (
      <>
        <BeehiveHeader/>
        {this.renderContents()}
      </>
    )
  }
}

export default Beehive