import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Container, Grid } from '@material-ui/core'
import { PoolListTokenTable, PoolInvestForm, Loading, PoolParamsGrid, InvestParamsGrid } from 'components'


@inject('root')
@observer
class PoolInvestView extends Component {
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

    if (!providerStore.getDefaultAccount()) {
      await providerStore.setWeb3WebClient()
    }

    const userAddress = providerStore.getDefaultAccount()

    // Get pool params
    await poolStore.fetchParams(address)
    await poolStore.fetchInvestParams(address, userAddress)
    await poolStore.fetchTokenParams(address)
  }

  render() {
    const { address } = this.state
    const { poolStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    const pool = poolStore.getPool(address)
    const paramsLoaded = poolStore.isParamsLoaded(address)
    const tokenParamsLoaded = poolStore.isTokenParamsLoaded(address)
    const investParamsLoaded = poolStore.isInvestParamsLoaded(address, userAddress)

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
          <Grid item xs={12} sm={12}>
            {
              investParamsLoaded ? (<InvestParamsGrid poolAddress={address} />) :
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
              tokenParamsLoaded && investParamsLoaded ?
                (<PoolInvestForm poolAddress={address} />)
                :
                (<Loading />)
            }
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolInvestView
