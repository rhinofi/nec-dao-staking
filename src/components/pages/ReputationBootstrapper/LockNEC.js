import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Table from 'components/common/Table'
import LockPanel from 'components/common/panels/LockPanel'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import TimelineProgress from 'components/common/TimelineProgress'
import LogoAndText from 'components/common/LogoAndText'
import TokenValue from 'components/common/TokenValue'
import icon from 'assets/svgs/ethfinex-logo.svg'
import * as deployed from 'deployed'
import * as helpers from 'utils/helpers'


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

  generateTableRows(data) {
    const tableData = []

    Object.keys(data).forEach(function (key, index) {

      const releasable = data[key].releasable

      /* Data
      userAddress
      lockId
      actionAvailable 
      (whatever else is needed will be set in popup)
      */

      const row = {
        extendActionData: data[key].lockId,
        releaseActionData: data[key].lockId,
        releasable,
        startPeriod: data[key].lockingPeriod,
        duration: `${data[key].duration} Months`,
        amount: `${helpers.fromWei(data[key].amount)} NEC`
      }

      tableData.push(row)
    })

    tableData.reverse()
    return tableData
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

  renderTable(userLocksLoaded, auctionDataLoaded, tableData, currentTab) {
    if (currentTab === tabs.YOUR_LOCKS && userLocksLoaded) {
      return (
        < Table
          columns={[
            { name: 'Period #', key: 'startPeriod', width: '20%', align: 'left' },
            { name: 'Amount', key: 'amount', width: '20%', align: 'left' },
            { name: 'Duration', key: 'duration', width: '20%', align: 'left' },
            { name: 'Releasable', key: 'releasable', width: '20%', align: 'left' },
            // { name: 'Extend', key: 'extendActionData', width: '15%', align: 'left' },
            { name: 'Action', key: 'releaseActionData', width: '20%', align: 'left' }
          ]}
          data={tableData}
          noDataMessage={'User has no token locks'}
        />
      )
    } else if (currentTab === tabs.AUCTION_DATA && auctionDataLoaded) {
      return (
        < Table
          columns={[
            { name: 'Period #', key: 'startPeriod', width: '20%', align: 'left' },
            { name: 'You Locked', key: 'amount', width: '20%', align: 'left' },
            { name: 'Total Locked', key: 'duration', width: '20%', align: 'left' },
            { name: 'You Recieved', key: 'releasable', width: '20%', align: 'left' },
            // { name: 'Extend', key: 'extendActionData', width: '15%', align: 'left' },
            { name: 'Action', key: 'releaseActionData', width: '20%', align: 'left' }
          ]}
          data={tableData}
          noDataMessage={'All period data not available!'}
        />)
    } else if (currentTab === tabs.YOUR_LOCKS) {
      return <div>Loading user locks...</div>
    } else if (currentTab === tabs.AUCTION_DATA) {
      return <div>Loading auction data</div>
    }

  }

  render() {
    const { lockNECStore, providerStore, tokenStore } = this.props.root
    const { currentTab } = this.state
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const schemeAddress = deployed.ContinuousLocking4Reputation

    // Check Loading Conditions
    const staticParamsLoaded = lockNECStore.isStaticParamsInitialLoadComplete()
    const hasBalance = tokenStore.hasBalance(necTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(necTokenAddress, userAddress, schemeAddress)
    const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)
    const auctionDataLoaded = lockNECStore.isAuctionDataInitialLoadComplete(userAddress)

    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return <div>Loading...</div>
    }

    const currentPeriod = lockNECStore.getActiveLockingPeriod()
    const maxPeriods = lockNECStore.staticParams.numLockingPeriods
    const userLocks = lockNECStore.getUserTokenLocks(userAddress)
    const tableData = this.generateTableRows(userLocks.data)
    const lockingStart = lockNECStore.staticParams.startTime
    const numPeriods = lockNECStore.staticParams.numLockingPeriods
    const periodLength = lockNECStore.staticParams.lockingPeriodLength


    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    const now = Math.round((new Date()).getTime() / 1000)

    let prefix = 'Next starts in'
    let ended = false

    let periodPercentage = 0
    let periodTimer = '...'

    // Locking Ended
    if (currentPeriod >= numPeriods) {
      if (Date.now() > lockingStart) {
        periodPercentage = 100
        periodTimer = 'Locking has ended'
        ended = true
      } else {
        prefix = 'Last auction ends in'
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

      // setAuctionPercentage((timeUntilNextBatch.toNumber() / auctionLength) * 100)
      periodTimer = `${prefix}, ${timeUntilNextBatch} time units`
    }

    // User Lock Data
    const data = lockNECStore.getUserTokenLocks(userAddress)

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
          {this.renderTable(userLocksLoaded, auctionDataLoaded, tableData, currentTab)}
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
