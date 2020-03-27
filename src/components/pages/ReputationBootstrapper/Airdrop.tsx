import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Divider from 'components/common/Divider'
import TimelineProgress from 'components/common/TimelineProgress'
import logo from 'assets/pngs/NECwithoutText.png'
import * as helpers from 'utils/helpers'
import { deployed } from 'config.json'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import LoadingCircle from '../../common/LoadingCircle'
import Tooltip from 'components/common/Tooltip'
import { RootStore } from 'stores/Root'
import BigNumber from 'utils/bignumber'
import { tooltip } from 'strings'

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
  height: 324px;
  padding-top: 20px;
  padding-bottom: 20px;
`

const ButtonWrapper = styled.div`
  width: 80%;
`

const Logo = styled.img`
  width: 50%;
`

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-tems: center;
  margin: 0px 0px 0px 0px;
  width: 80%
`

const InfoTitle = styled.div`
  display: flex;
  flex-direction: row;
  color: var(--inactive-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  letter-spacing: 1px;
`

const Info = styled(InfoTitle)`
  color: var(--white-text);
  text-align: right;
`

const LoadingCircleWrapper = styled.div`
  height: 40px;
  margin-top: -26px;
`

interface InfoLineProps {
  title: string;
  info: any;
  hasTooltip: boolean,
  tooltipText?: string
}

const InfoLine = (props: InfoLineProps) => {
  const { title, info, hasTooltip } = props
  return (
    < InfoWrapper >
      <InfoTitle>
        {title}
        {hasTooltip ? <Tooltip title="" content={tooltip.airdropBlocknumber} position="right top" /> : <div />}
      </InfoTitle>
      <Info>{info}</Info>
    </InfoWrapper >
  )
}

@inject('root')
@observer
class Airdrop extends React.Component<any, any>{
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
    const { airdropStore, timeStore } = this.props.root as RootStore

    let dropPercentage = 0
    let dropTimer = '...'
    let dropStatus = snapshotStatus.NOT_STARTED

    const { snapshotBlock } = airdropStore.staticParams
    const now = timeStore.currentTime
    const currentBlock = timeStore.currentBlock
    const claimPeriodStart = airdropStore.getClaimPeriodStart()
    const claimPeriodEnd = airdropStore.getClaimPeriodEnd()

    const timeUntilEnd = helpers.formatTimeRemaining(airdropStore.getSecondsUntilClaimsEnd())

    const isSnapshotPassed = airdropStore.isAfterSnapshot()
    const isClaimPeriodStarted = airdropStore.isClaimPeriodStarted()
    const isClaimPeriodEnded = airdropStore.isClaimPeriodEnded()
    const isClaimPeriodActive = isClaimPeriodStarted && !isClaimPeriodEnded

    if (isSnapshotPassed && !isClaimPeriodStarted) {
      dropPercentage = 100
      dropTimer = 'Has Concluded'
      dropStatus = snapshotStatus.SNAPSHOT_CONCLUDED
    }

    else if (isSnapshotPassed && isClaimPeriodActive) {
      dropPercentage = helpers.getPercentage(claimPeriodStart, now, claimPeriodEnd)

      dropTimer = `Claiming ends in ${timeUntilEnd}`
      dropStatus = snapshotStatus.CLAIM_STARTED
    }

    else if (isSnapshotPassed && isClaimPeriodEnded) {
      dropPercentage = 100
      dropTimer = 'Claim Period has Ended'
      dropStatus = snapshotStatus.CLAIM_ENDED
    }

    else if (!isSnapshotPassed) {
      //This should probably be the deployment block
      const arbitraryStartBlock = 5000000
      const blocksUntilSnapshot = snapshotBlock - currentBlock

      dropPercentage = helpers.getPercentage(arbitraryStartBlock, currentBlock, snapshotBlock)
      dropTimer = `In ${blocksUntilSnapshot} ${helpers.blocksText(blocksUntilSnapshot)}`
    }

    return {
      dropPercentage,
      dropTimer,
      dropStatus
    }
  }

  redeem() {
    const { airdropStore, providerStore } = this.props.root as RootStore
    const userAddress = providerStore.getDefaultAccount()
    airdropStore.redeem(userAddress)
  }

  onBuyNecLink = () => {
    window.open(
      'http://app.deversifi.com/NECETH',
      '_blank'
    )
  }

  renderActionButton(status, userBalance: BigNumber, pending, userData) {
    const { airdropStore, timeStore } = this.props.root as RootStore
    if (status === snapshotStatus.NOT_STARTED) {
      return (<ActiveButton onClick={() => this.onBuyNecLink()}>Buy NEC
      </ActiveButton>)
    }
    const now = timeStore.currentTime
    const timeUntilStart = helpers.formatTimeRemaining(airdropStore.getClaimPeriodStart())

    const hasRedeemed = userData.hasRedeemed
    if (userBalance.eq(helpers.ZERO)) {
      // return (<div>This address has no REP to claim from the Airdrop</div>)
      return (<InactiveButton>No REP to Claim</InactiveButton>)
    }

    if (pending) {
      return (<LoadingCircleWrapper><LoadingCircle instruction="Claiming REP..." /></LoadingCircleWrapper>)
    }

    if (status === snapshotStatus.CLAIM_STARTED && !userBalance.eq(helpers.ZERO) && !hasRedeemed) {
      return (<ActiveButton onClick={() => { this.redeem() }}>Claim REP</ActiveButton>)
    }

    if (hasRedeemed) {
      return (<InactiveButton>REP Claimed</InactiveButton>)
    }

    if (status === snapshotStatus.CLAIM_ENDED && !userBalance.eq(helpers.ZERO) && !hasRedeemed) {
      return (<InactiveButton>Claim Period has Ended</InactiveButton>)
    }

    if (status === snapshotStatus.SNAPSHOT_CONCLUDED) {
      return (<InactiveButton>{`Claiming starts in ${timeUntilStart}`}</InactiveButton>)
    }
  }

  render() {
    const { airdropStore, providerStore, tokenStore, timeStore } = this.props.root as RootStore
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const staticParamsLoaded = airdropStore.areStaticParamsLoaded()
    const userDataLoaded = airdropStore.isUserDataLoaded(userAddress)
    const now = timeStore.currentTime
    const redeemPending = airdropStore.isRedeemPending()

    if (!staticParamsLoaded || !userDataLoaded) {
      return (<LoadingCircle instruction={'Loading...'} subinstruction={''} />)
    }

    const userData = airdropStore.getUserData(userAddress)
    const snapshotBlock = airdropStore.getSnapshotBlock()
    const currentBlock = timeStore.currentBlock
    const dropVisuals = this.calcDropVisuals()
    const { dropPercentage, dropTimer, dropStatus } = dropVisuals


    /*  Before the snapshot, well get the users' CURRENT balance
        After the snapshot, we'll get the users SNAPSHOT balance
    */

    let necBalance: BigNumber
    if (dropStatus === snapshotStatus.NOT_STARTED) {
      necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    } else {
      necBalance = userData.balance
    }

    const necBalanceDisplay = helpers.tokenDisplay(necBalance)
    const repDisplay = helpers.tokenDisplay(userData.rep)

    return (
      <AirdropWrapper>
        <TimelineProgress
          value={dropPercentage}
          icon={<Logo src={logo} alt="ethfinex" />}
          title="necDAO Reputation Airdrop"
          subtitle={dropTimer}
          width="50px"
          height="50px"
          displayTooltip={false}
          tooltipContent={tooltip.airdropExplainer}
        />
        <Divider />
        <InfoLine title="Nectar Balance" info={`${necBalanceDisplay} NEC`} hasTooltip={false} />
        <InfoLine title="Airdropped Voting Power" info={`${repDisplay} REP`} hasTooltip={false} />
        <Divider />
        <InfoLine title="Airdrop Blocknumber" info={snapshotBlock} hasTooltip={true} />
        <InfoLine title="Current Blocknumber" info={currentBlock} hasTooltip={false} />
        <Divider />
        <ButtonWrapper>
          {this.renderActionButton(dropStatus, necBalance, redeemPending, userData)}
        </ButtonWrapper>
      </AirdropWrapper>
    )
  }
}

export default Airdrop
