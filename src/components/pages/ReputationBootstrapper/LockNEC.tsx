import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import LockPanel from 'components/common/panels/LockPanel'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import TimelineProgress from 'components/common/TimelineProgress'
import LogoAndText from 'components/common/LogoAndText'
import TokenValue from 'components/common/TokenValue'
import icon from 'assets/pngs/NECwithoutText.png'
import { deployed } from 'config.json'
import BatchesTable from 'components/tables/BatchesTable'
import UserLocksTable from 'components/tables/UserLocksTable'
import LoadingCircle from '../../common/LoadingCircle'
import { RootStore } from 'stores/Root'

const LockNECWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  max-height: 500px;
`

const DetailsWrapper = styled.div`
  width: 80%;
  height: 364px;
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

const TableTabEnumWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 103px
`

const TableTabButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 7.5px 14px;
  margin-left: 12px;
  background: var(--background);
  border: 1px solid var(--active-border);
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
`

const InactiveTableTabButton = styled(TableTabButton)`
  color: var(--inactive-header-text);
  border: 1px solid var(--inactive-border);
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

enum TabEnum {
  YOUR_LOCKS,
  ALL_PERIODS
}

const status = {
  NOT_STARTED: 0
}

type Props = {
  root: RootStore
}

type State = {
  currentTab: TabEnum
}

@inject('root')
@observer
class LockNEC extends React.Component<any, State> {
  constructor(props) {
    super(props)

    this.state = {
      currentTab: TabEnum.ALL_PERIODS
    }
  }

  setCurrentTab(value) {
    this.setState({ currentTab: value })
  }

  SidePanel = () => {
    const { lockNECStore, tokenStore, providerStore } = this.props.root as RootStore
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const spenderAddress = deployed.ContinuousLocking4Reputation

    const tokenApproved = tokenStore.hasMaxApproval(necTokenAddress, userAddress, spenderAddress)
    const approvePending = tokenStore.isApprovePending(necTokenAddress, userAddress, spenderAddress)
    const lockPending = lockNECStore.isLockActionPending()

    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()

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
              userAddress={userAddress}
              enabled={isLockingStarted && !isLockingEnded}
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
    const { lockNECStore, timeStore } = this.props.root as RootStore

    const currentPeriod = lockNECStore.getActiveLockingPeriod()
    const finalPeriod = lockNECStore.getFinalPeriodIndex()
    const periodLength = lockNECStore.staticParams.batchTime
    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()
    const numPeriods = lockNECStore.staticParams.numLockingPeriods
    const finalPeriodIndex = lockNECStore.getFinalPeriodIndex()

    let periodPercentage = 0
    let periodTimer = '...'
    let periodStatus = 0
    let periodTitle = `Current Period: ${currentPeriod} of ${finalPeriodIndex}`

    let prefix = 'Next starts in'

    if (!isLockingStarted) {
      prefix = 'First period starts in'
      periodTitle = "Locking has not started"
    }


    if (currentPeriod === finalPeriod && !isLockingEnded) {
      prefix = 'Last period ends in'
    }

    // Locking In Progress
    if (!isLockingEnded) {
      const timeUntilNextBatch = Number(lockNECStore.getTimeUntilNextPeriod())
      periodPercentage = (timeUntilNextBatch / periodLength) * 100
      periodTimer = `${prefix}, ${timeUntilNextBatch} seconds`
    }

    // Locking Ended
    if (isLockingEnded) {
      periodPercentage = 100
      periodTimer = ''
      periodTitle = 'Locking has ended'
    }

    return {
      periodPercentage,
      periodTimer,
      periodStatus,
      periodTitle
    }
  }

  renderTable(currentTab) {
    if (currentTab === TabEnum.YOUR_LOCKS) {
      return (
        <UserLocksTable />
      )
    } else if (currentTab === TabEnum.ALL_PERIODS) {
      return (
        < BatchesTable highlightTopRow />
      )
    }
  }

  TabButton = (currentTab, tabType, tabText) => {
    if (currentTab === tabType) {
      return (
        <TableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </TableTabButton>
      )
    } else {
      return (
        <InactiveTableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </InactiveTableTabButton>
      )
    }
  }

  render() {
    const { lockNECStore, providerStore, tokenStore, timeStore } = this.props.root as RootStore
    const { currentTab } = this.state
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const schemeAddress = deployed.ContinuousLocking4Reputation

    // Check Loading Conditions
    const staticParamsLoaded = lockNECStore.areStaticParamsLoaded()
    const hasBalance = tokenStore.hasBalance(necTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(necTokenAddress, userAddress, schemeAddress)
    const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)
    const userBatchesLoaded = lockNECStore.areBatchesLoaded(userAddress)

    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return (<LoadingCircle instruction={'Loading...'} subinstruction={''} />)
    }

    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    const now = timeStore.currentTime

    const timerVisuals = this.getTimerVisuals()

    const { periodPercentage, periodTimer, periodTitle } = timerVisuals

    return (
      <LockNECWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={periodPercentage}
              title={periodTitle}
              subtitle={periodTimer}
              width="28px"
              height="28px"
              displayTooltip={true}
            />
            <TableTabEnumWrapper>
              {this.TabButton(currentTab, TabEnum.ALL_PERIODS, "All Periods")}
              {this.TabButton(currentTab, TabEnum.YOUR_LOCKS, "Your Locks")}
            </TableTabEnumWrapper>
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
