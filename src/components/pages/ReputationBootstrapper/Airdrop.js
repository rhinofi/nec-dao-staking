import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Divider from 'components/common/Divider'
import TimelineProgress from 'components/common/TimelineProgress'
import logo from 'assets/svgs/ethfinex-logo.svg'
import * as helpers from 'utils/helpers'
import * as deployed from 'deployed.json'

const propertyNames = {
  STATIC_PARAMS: 'staticParams',
  USER_DATA: 'userData'
}

const AirdropWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border);
  border-top: none;
  border-bottom: none;
  width: 450px;
  padding-top: 20px;
`

const Logo = styled.img`
  width: 50%;
`

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-tems: center;
  margin: 0px 0px 0px 0px;
  width: 80%
`

const InfoTitle = styled.div`
  color: var(--inactive-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  letter-spacing: 1px;
  width: 100%
`

const Info = styled(InfoTitle)`
  color: var(--white-text);
  text-align: right;
`

const Button = styled.div`
  background: var(--action-button);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  padding: 10px 0px;
  width: 80%;
  margin-bottom: 20px;
`

const InfoLine = ({ title, info }) => (
  <InfoWrapper>
    <InfoTitle>{title}</InfoTitle>
    <Info>{info}</Info>
  </InfoWrapper>
)

@inject('root')
@observer
class Airdrop extends React.Component {

  async componentDidMount() {
    const { airdropStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    await airdropStore.fetchStaticParams()
    await airdropStore.fetchUserData(userAddress)
  }

  calcDropVisuals() {
    const { airdropStore } = this.props.root

    let dropPercentage = 0
    let dropTimer = '...'

    const dropBlock = airdropStore.staticParams.snapshotBlock
    const latestBlock = helpers.getCurrentBlock()

    debugger

    // Calculate the number of days and hours the dropBlock is from the current block
    const blockDiff = dropBlock - latestBlock

    let seconds = blockDiff * 13
    if (seconds < 13) {
      seconds = 0
    }

    if (seconds === 0) {
      dropPercentage = 100
      dropTimer = 'Has Concluded'
    } else {
      let hours = (seconds / 60) / 60
      const days = Math.fround(hours / 24)
      hours -= days * 24
      hours = Math.fround(hours)
      dropTimer = `In ${days} days, ${hours} hours`

      // Using 30 days a duration length
      const maxDays = 30
      dropPercentage = 100 * (1 - (seconds / (maxDays * 24 * 60 * 60)))
    }

    return {
      dropPercentage,
      dropTimer
    }
  }

  render() {
    const { airdropStore, providerStore, timeStore } = this.props.root

    const userAddress = providerStore.getDefaultAccount()

    const staticParamsLoaded = airdropStore.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)

    const userDataLoaded = airdropStore.isPropertyInitialLoadComplete(propertyNames.USER_DATA, userAddress)

    if (!staticParamsLoaded || !userDataLoaded) {
      return <div></div>
    }

    const necBalance = airdropStore.getSnapshotBalance(userAddress)
    const necBalanceDisplay = helpers.fromWei(necBalance)
    const repBalance = airdropStore.getSnapshotRep(userAddress)
    const dropBlock = airdropStore.snapshotBlock
    const currentBlock = timeStore.currentBlock
    const dropVisuals = this.calcDropVisuals()
    const { dropPercentage, dropTimer } = dropVisuals

    return (
      <AirdropWrapper>
        <TimelineProgress
          value={dropPercentage}
          icon={<Logo src={logo} alt="ethfinex" />}
          title="NectarDAO Reputation Airdrop"
          subtitle={dropTimer}
          width="50px"
          height="50px"
        />
        <Divider width="80%" margin="20px 0px 20px 0px" />
        <InfoLine title="Nectar Balance" info={necBalanceDisplay} />
        <InfoLine title="Receive Voting Power" info={repBalance} />
        <Divider width="80%" margin="20px 0px 20px 0px" />
        <InfoLine title="Airdrop Blocknumber" info={dropBlock} />
        <InfoLine title="Current Blocknumber" info={currentBlock} />
        <Divider width="80%" margin="20px 0px 20px 0px" />
        <Button>Buy NEC</Button>
      </AirdropWrapper>
    )
  }
}

export default Airdrop
