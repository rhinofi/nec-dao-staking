import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Divider from 'components/common/Divider'
import TimelineProgress from 'components/common/TimelineProgress'
import logo from 'assets/svgs/ethfinex-logo.svg'
import * as helpers from 'utils/helpers'
import * as deployed from 'deployed.json'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import LoadingCircle from '../../common/LoadingCircle'

const propertyNames = {
  STATIC_PARAMS: 'staticParams',
  USER_DATA: 'userData'
}

const snapshotStatus = {
  NOT_STARTED: 0,
  SNAPSHOT_CONCLUDED: 1,
  CLAIM_STARTED: 2,
  CLAIM_ENDED: 3
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
    const { airdropStore, tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken

    await airdropStore.fetchStaticParams()
    await tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
    await airdropStore.fetchUserData(userAddress)
  }

  calcSnapshotConcluded(snapshotBlock, latestBlock) {
    const blockDiff = snapshotBlock - latestBlock

    let seconds = blockDiff * 13
    if (seconds < 13) {
      seconds = 0
    }

    if (seconds === 0) {
      return true
    } else {
      return false
    }
  }

  calcTimeTillSnapshot(secondsUntilSnapshot) {
    const seconds = secondsUntilSnapshot
    let hours = (seconds / 60) / 60
    const days = Math.fround(hours / 24)
    hours -= days * 24
    hours = Math.fround(hours)

    return {
      seconds,
      hours,
      days,
    }
  }

  /*
    Before the snapshot block:
      - Display time till snapshot
      - 'Buy NEC' Button

      After the snapshot block, and within claim time:
      - Display 'Claim Period Active'
      - 'Claim REP' button IF the users balance > 0

      After the snapshot block, and after claim time:
      - Display 'Claim Period Concluded'
      - No button
  */
  calcDropVisuals() {
    const { airdropStore, timeStore } = this.props.root

    let dropPercentage = 0
    let dropTimer = '...'
    let dropStatus = snapshotStatus.NOT_STARTED

    const { snapshotBlock } = airdropStore.staticParams
    const now = timeStore.currentTime
    const currentBlock = timeStore.currentBlock

    const isSnapshotPassed = airdropStore.isAfterSnapshot()
    const isClaimPeriodStarted = airdropStore.isClaimPeriodStarted()
    const isClaimPeriodEnded = airdropStore.isClaimPeriodEnded()
    const isClaimPeriodActive = isClaimPeriodStarted && !isClaimPeriodEnded

    if (isSnapshotPassed && !isClaimPeriodStarted) {
      dropPercentage = 100
      dropTimer = 'Has Concluded'
      dropStatus = snapshotStatus.SNAPSHOT_CONCLUDED
    }

    if (isSnapshotPassed && isClaimPeriodActive) {
      dropPercentage = 100
      dropTimer = 'Claim Period Active'
      dropStatus = snapshotStatus.CLAIM_STARTED
    }

    if (isSnapshotPassed && !isClaimPeriodActive) {
      dropPercentage = 100
      dropTimer = 'Claim Period has Ended'
      dropStatus = snapshotStatus.CLAIM_ENDED
    }


    if (!isSnapshotPassed) {
      //This should probably be the deployment block
      const timerBlockDuration = 1728
      const blocksUntilSnapshot = airdropStore.getBlocksUntilSnapshot()

      dropPercentage = 100 * (blocksUntilSnapshot / timerBlockDuration)
      dropTimer = `In ${blocksUntilSnapshot} blocks`
    }

    return {
      dropPercentage,
      dropTimer,
      dropStatus
    }
  }

  redeem() {
    const { airdropStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    airdropStore.redeem(userAddress)
  }

  renderActionButton(status, userBalance, pending) {
    if (status === snapshotStatus.NOT_STARTED) {
      return (<ActiveButton>Buy NEC</ActiveButton>)
    }

    else if (userBalance === "0") {
      // return (<div>This address has no REP to claim from the Airdrop</div>)
      return (<React.Fragment></React.Fragment>)
    }

    else if (status === snapshotStatus.CLAIM_STARTED && userBalance !== "0") {
      if (!pending) {
        return (<ActiveButton onClick={() => { this.redeem() }}>Claim REP</ActiveButton>)
      } else {
        return (<ActiveButton><LoadingCircle></LoadingCircle></ActiveButton>)
      }

    }

    else if (status === snapshotStatus.CLAIM_ENDED && userBalance !== "0") {
      if (!pending) {
        return (<InactiveButton>Claim REP</InactiveButton>)
      } else {
        return (<InactiveButton><LoadingCircle></LoadingCircle></InactiveButton>)
      }

    }
  }

  render() {
    const { airdropStore, providerStore, tokenStore, timeStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const staticParamsLoaded = airdropStore.areStaticParamsLoaded()
    const userDataLoaded = airdropStore.isUserDataLoaded(userAddress)

    const data = airdropStore.userData[userAddress]

    const redeemPending = airdropStore.isRedeemPending()

    if (!staticParamsLoaded || !userDataLoaded) {
      return (<LoadingCircle instruction={''} subinstruction={''} />)
    }

    const repBalance = airdropStore.getSnapshotRep(userAddress)
    const snapshotBlock = airdropStore.getSnapshotBlock()
    const currentBlock = timeStore.currentBlock
    const dropVisuals = this.calcDropVisuals()
    const { dropPercentage, dropTimer, dropStatus } = dropVisuals

    /* Before the snapshot, well get the users' CURRENT balance
       After the snapshot, we'll get the users SNAPSHOT balance
    */

    let necBalance
    if (dropStatus === snapshotStatus.NOT_STARTED) {
      necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    } else {
      necBalance = airdropStore.getSnapshotBalance(userAddress)
    }

    const necBalanceDisplay = helpers.roundValue(helpers.fromWei(necBalance))

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
        <InfoLine title="Airdrop Blocknumber" info={snapshotBlock} />
        <InfoLine title="Current Blocknumber" info={currentBlock} />
        <Divider width="80%" margin="20px 0px 20px 0px" />
        {this.renderActionButton(dropStatus, necBalance, redeemPending)}
      </AirdropWrapper>
    )
  }
}

export default Airdrop
