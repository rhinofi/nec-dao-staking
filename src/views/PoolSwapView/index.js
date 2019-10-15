import React, { Component } from 'react'
import { Container, Grid } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import { SpotPriceCard, PoolParamsGrid, SwapForm, PoolListTokenTable, Loading } from 'components'

@inject('root')
@observer
class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  async componentDidMount() {
    const { address } = this.props.match.params
    const { providerStore, poolStore } = this.props.root
    this.setState({ address })

    if (!providerStore.defaultAccount) {
      await providerStore.setWeb3WebClient()
    }

    // Get pool params
    await poolStore.fetchParams(address)
    await poolStore.fetchTokenParams(address)
  }

  render() {
    const { address } = this.state
    const { poolStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    const pool = poolStore.getPool(address)
    const paramsLoaded = poolStore.isParamsLoaded(address)
    const tokenParamsLoaded = poolStore.isTokenParamsLoaded(address)

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            {
              paramsLoaded ? (<PoolParamsGrid poolAddress={address} />) :
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Loading />
                </div>
            }
          </Grid>
          <Grid item xs={12}>
            {
              tokenParamsLoaded ? (<PoolListTokenTable displayMode="pool" poolAddress={address} userAddress={userAddress} linkPath="logs" />) :
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Loading />
                </div>
            }
          </Grid>
          <Grid container>
            {
              paramsLoaded && tokenParamsLoaded ?
                (<SwapForm poolAddress={address} />)
                :
                (<Loading />)
            }
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolSwapView
