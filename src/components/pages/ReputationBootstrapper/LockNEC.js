import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import LockPanel from 'components/common/panels/LockPanel'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import TimelineProgress from 'components/common/TimelineProgress'
import LogoAndText from 'components/common/LogoAndText'
import TokenValue from 'components/common/TokenValue'
import icon from 'assets/svgs/ethfinex-logo.svg'
import * as deployed from 'deployed'
import * as helpers from 'utils/helpers'
import LockDataTable from 'components/tables/LockDataTable'
import UserLocksTable from 'components/tables/UserLocksTable'
import LoadingCircle from '../../common/LoadingCircle'


const { BN } = helpers

const propertyNames = {
  STATIC_PARAMS: 'staticParams',
  USER_LOCKS: 'userLocks',
  AUCTION_DATA: 'auctionData'
}


const LockNECWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  max-height: 500px;
`

const DetailsWrapper = styled.div`
  width: 80%;
  border-right: 1px solid var(--border);
`

const TableHeaderWrapper = styled.div`
  height: 103px
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 24px;
  border-bottom: 1px solid var(--border);
`

const TableTabsWrapper = styled.div`
  height: 103px
  display: flex;
  flex-direction: row;
`

const ActionsWrapper = styled.div`
  width: 425px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`

const ActionsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0px 24px;
  color: var(--white-text);
  border-bottom: 1px solid var(--border);
`

const TableTabButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 34px;
  margin: 0px 24px;
  background: var(--action-button);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
`

const tabs = {
  YOUR_LOCKS: 0,
  ALL_PERIODS: 1
}

@inject('root')
@observer
class LockNEC extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTab: tabs.YOUR_LOCKS
    }
  }

  setCurrentTab(value) {
    this.setState({ currentTab: value })
  }

  async componentDidMount() {
    const { lockNECStore, providerStore, tokenStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const schemeAddress = deployed.ContinuousLocking4Reputation

    if (!lockNECStore.isStaticParamsInitialLoadComplete()) {
      await lockNECStore.fetchStaticParams()
    }

    await tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
    await tokenStore.fetchAllowance(necTokenAddress, userAddress, schemeAddress)
    await lockNECStore.fetchUserLocks(userAddress)
  }

  SidePanel = () => {
    const { lockNECStore, tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const spenderAddress = deployed.ContinuousLocking4Reputation

    const tokenApproved = tokenStore.getMaxApprovalFlag(necTokenAddress, userAddress, spenderAddress)
    const approvePending = tokenStore.isApprovePending(necTokenAddress, userAddress, spenderAddress)
    const lockPending = lockNECStore.isLockActionPending()

    return (
      < React.Fragment >
        {tokenApproved === false ?
          <EnableTokenPanel
            instruction="Enable NEC for locking"
            subinstruction="-"
            buttonText="Enable NEC"
            userAddress={userAddress}
            tokenAddress={necTokenAddress}
            spenderAddress={spenderAddress}
            enabled={tokenApproved}
            pending={approvePending}
          />
          :
          <div>
            <LockPanel
              rangeStart={1}
              buttonText="Lock NEC"
              pending={lockPending}
            />
          </div>
        }
      </React.Fragment >
    )
  }

  /*
  Remaining Time
  IF > 1 day
    x days, y hours
  IF < 1 day && > 1 hour
    y hours, z minutes
  IF < 1 hour && > 1 min
    y minutes, z minutes
  IF < 1 min && > 0 seconds
  */
  getTimerVisuals() {
    const { lockNECStore, timeStore } = this.props.root

    let prefix = 'Next starts in'
    let ended = false

    let periodPercentage = 0
    let periodTimer = '...'

    const now = timeStore.currentTime
    const currentPeriod = Number(lockNECStore.getActiveLockingPeriod())
    const numLockingPeriods = Number(lockNECStore.staticParams.numLockingPeriods)
    const lockingStart = Number(lockNECStore.staticParams.startTime)
    const numPeriods = Number(lockNECStore.staticParams.numLockingPeriods)
    const periodLength = Number(lockNECStore.staticParams.lockingPeriodLength)

    // Locking Ended
    if (currentPeriod >= numPeriods) {
      if (now > lockingStart) {
        periodPercentage = 100
        periodTimer = 'Locking has ended'
        ended = true
      } else {
        prefix = 'Last period ends in'
      }
    }

    // Locking In Progress
    if (!ended) {
      const batchTime = new BN(periodLength)
      const currentBatch = new BN(currentPeriod)
      const startTime = new BN(lockingStart)
      const currentBatchEndTime = batchTime.mul(currentBatch.add(new BN(1))).add(startTime)
      const nowTime = new BN(now)
      const timeUntilNextBatch = currentBatchEndTime.sub(nowTime)

      periodPercentage = (timeUntilNextBatch.toNumber() / periodLength) * 100
      periodTimer = `${prefix}, ${timeUntilNextBatch} seconds`
    }

    return {
      periodPercentage,
      periodTimer
    }
  }

  renderTable(currentTab) {
    if (currentTab === tabs.YOUR_LOCKS) {
      return (
        <UserLocksTable />
      )
    } else if (currentTab === tabs.AUCTION_DATA) {
      return (
        < LockDataTable />
      )
    }
  }

  render() {
    const { lockNECStore, providerStore, tokenStore, timeStore } = this.props.root
    const { currentTab } = this.state
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const schemeAddress = deployed.ContinuousLocking4Reputation

    console.log(currentTab)

    // Check Loading Conditions
    const staticParamsLoaded = lockNECStore.isStaticParamsInitialLoadComplete()
    const hasBalance = tokenStore.hasBalance(necTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(necTokenAddress, userAddress, schemeAddress)
    const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)
    const auctionDataLoaded = lockNECStore.isAuctionDataInitialLoadComplete(userAddress)

    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return (<LoadingCircle instruction={''} subinstruction={''} />)
    }

    const currentPeriod = lockNECStore.getActiveLockingPeriod()
    const maxPeriods = lockNECStore.staticParams.numLockingPeriods

    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    const now = timeStore.currentTime

    const timerVisuals = this.getTimerVisuals()

    const { periodPercentage, periodTimer } = timerVisuals

    return (
      <LockNECWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={periodPercentage}
              title={`Current Period: ${currentPeriod} of ${maxPeriods}`}
              subtitle={periodTimer}
              width="28px"
              height="28px"
            />
            <TableTabsWrapper>
              <TableTabButton onClick={() => this.setCurrentTab(tabs.YOUR_LOCKS)}>Your Locks</TableTabButton>
              <TableTabButton onClick={() => this.setCurrentTab(tabs.ALL_PERIODS)}>All Periods</TableTabButton>
            </TableTabsWrapper>
          </TableHeaderWrapper>
          {this.renderTable(currentTab)}
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={icon} text="Nectar" />
            <TokenValue weiValue={necBalance} />
          </ActionsHeader>
          {this.SidePanel()}
        </ActionsWrapper>
      </LockNECWrapper >
    )
  }
}

export default LockNEC
