import React, { Component } from 'react'
import { Container, Grid, Typography, TextField, Button } from '@material-ui/core'
import * as helpers from 'utils/helpers'
import { PoolParamsGrid, MoreParamsGrid, PoolListTokenTable, Loading } from 'components'
import { formNames } from 'stores/ManageForm'
import { observer, inject } from 'mobx-react'

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
    await poolStore.fetchAllWhitelistedTokenParams(address)
  }

  updateProperty(form, key, value) {
    this.props.root.manageFormStore[form][key] = value
  }

  onChange = (event, form) => {
    console.log(event.target)
    console.log(form)
    this.updateProperty(form, event.target.name, event.target.value)
  }

  buildBindTokenForm() {
    const { manageFormStore, poolStore } = this.props.root
    const { address } = this.state

    return (
      <Container>
        <div>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <TextField
                id="token-address"
                label="Token Address"
                name="address"
                value={manageFormStore.bindTokenForm.address}
                onChange={e => this.onChange(e, formNames.BIND_TOKEN_FORM)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                onClick={() => poolStore.bind(address, manageFormStore.bindTokenForm.address)}
              >
                Submit
                  </Button>
            </Grid>
          </Grid>
        </div>
      </Container>
    )
  }

  buildSetTokenParamsForm() {
    const { manageFormStore, poolStore } = this.props.root
    const { address } = this.state

    const tokenAddress = manageFormStore.setTokenParamsForm.address
    const balance = manageFormStore.setTokenParamsForm.balance
    const weight = manageFormStore.setTokenParamsForm.weight

    return (<Container>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TextField
              id="token-address"
              label="Token Address"
              name="address"
              value={tokenAddress}
              onChange={e => this.onChange(e, formNames.SET_TOKEN_PARAMS_FORM)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="token-address"
              label="Balance"
              name="balance"
              type="number"
              value={balance}
              onChange={e => this.onChange(e, formNames.SET_TOKEN_PARAMS_FORM)}
            />
          </Grid>
          <Grid item xs={12} sm={4}><TextField
            id="token-address"
            label="Weight"
            name="weight"
            type="number"
            value={weight}
            onChange={e => this.onChange(e, formNames.SET_TOKEN_PARAMS_FORM)}
          /></Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
              onClick={() => poolStore.setTokenParams(address, tokenAddress, helpers.toWei(balance), helpers.toWei(weight))}
            >
              Submit
                </Button>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  buildSetFeeForm() {
    const { manageFormStore, poolStore } = this.props.root
    const { address } = this.state

    const swapFee = manageFormStore.setFeeForm.swapFee
    const exitFee = manageFormStore.setFeeForm.exitFee

    return (<Container>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              id="swap-fee-amount"
              label="Swap Fee"
              type="number"
              name="swapFee"
              value={swapFee}
              onChange={e => this.onChange(e, formNames.SET_FEE_FORM)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="exit-fee-amount"
              label="Exit Fee"
              type="number"
              name="exitFee"
              value={exitFee}
              onChange={e => this.onChange(e, formNames.SET_FEE_FORM)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
              onClick={() => poolStore.setFees(address, helpers.fromPercentageToFee(swapFee), helpers.fromPercentageToFee(exitFee))}
            >
              Submit
                </Button>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  buildMakePublicButton() {
    const { manageFormStore, poolStore } = this.props.root
    const { address } = this.state

    const initialSupply = manageFormStore.makeSharedForm.initialSupply

    return (<Container>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              id="fee-amount"
              label="Initial Pool Token Supply"
              type="number"
              name="initialSupply"
              value={initialSupply}
              onChange={e => this.onChange(e, formNames.MAKE_SHARED_FORM)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
              onClick={() => poolStore.finalize(address, helpers.toWei(initialSupply))}>Submit
                </Button>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  render() {
    const { address } = this.state
    const { poolStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    const pool = poolStore.getPool(address)
    const paramsLoaded = poolStore.isParamsLoaded(address)
    const tokenParamsLoaded = poolStore.isWhitelistTokenParamsLoaded(address)

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pool</Typography>
            <br />
            {paramsLoaded ? (
              <PoolParamsGrid poolAddress={address} />
            ) : (
                <Loading />
              )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" component="h5" > Tokens</Typography >
            {
              tokenParamsLoaded ? (<PoolListTokenTable displayMode="whitelist+pool" poolAddress={address} userAddress={userAddress} linkPath="logs" />) :
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Loading />
                </div>
            }
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Add Token</Typography>
                <br />
                {this.buildBindTokenForm()}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Edit Token</Typography>
                <br />
                {this.buildSetTokenParamsForm()}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Set fee (%)</Typography>
                <br />
                {this.buildSetFeeForm()}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Make Shared</Typography>
                <br />
                {this.buildMakePublicButton()}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12}>
            {
              paramsLoaded ? (<MoreParamsGrid poolAddress={address} />) :
                (<Loading />)
            }

          </Grid>
        </Grid>
      </Container >
    )
  }
}

export default PoolSwapView
