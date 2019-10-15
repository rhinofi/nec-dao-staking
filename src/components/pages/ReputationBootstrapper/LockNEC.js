import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Table from 'components/common/Table'
import LockPanel from 'components/common/panels/LockPanel'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import TimelineProgress from 'components/common/TimelineProgress'
import LogoAndText from 'components/common/LogoAndText'
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

@inject('root')
@observer
class LockNEC extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      periodPercentage: 0,
      periodTimer: '...'
    }
  }

  async componentDidMount() {
    const { lockNECStore, providerStore, tokenStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const schemeAddress = deployed.ContinuousLocking4Reputation

    await lockNECStore.fetchStaticParams()
    await lockNECStore.fetchUserLocks(userAddress)
    await tokenStore.fetchBalanceOf(necTokenAddress, userAddress)
    await tokenStore.fetchAllowance(necTokenAddress, userAddress, schemeAddress)
  }

  setPeriodPercentage(value) {
    this.setState({ periodPercentage: value })
  }

  setPeriodTimer(value) {
    this.setState({ periodTimer: value })
  }
  generateTableRows(data) {
    const tableData = []

    Object.keys(data).forEach(function (key, index) {

      const row = {
        id: data[key].lockId,
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
    const { tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const necTokenAddress = deployed.NectarToken
    const spenderAddress = deployed.ContinuousLocking4Reputation

    const tokenApproved = tokenStore.getMaxApprovalFlag(necTokenAddress, userAddress, spenderAddress)

    return (
      < React.Fragment >
        {tokenApproved === false ?
          <EnableTokenPanel
            instruction="Enable NEC for locking"
            subinstruction="-"
            buttonText="Enable NEC"
            userAddress={userAddress}
            tokenAddress={necTokenAddress}
            spenderAddress={spenderAddress} />
          :
          <div>
            <LockPanel
              rangeStart={1}
              buttonText="Lock NEC"
            />
          </div>
        }
      </React.Fragment >
    )
  }

  render() {
    const { lockNECStore, providerStore, tokenStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    const staticParamsLoaded = lockNECStore.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)

    const userLocksLoaded = lockNECStore.isPropertyInitialLoadComplete(propertyNames.USER_LOCKS)

    if (!staticParamsLoaded || !userLocksLoaded) {
      return <div></div>
    }

    const currentPeriod = lockNECStore.getActiveLockingPeriod()
    const maxPeriods = lockNECStore.staticParams.numLockingPeriods
    const userLocks = lockNECStore.getUserTokenLocks(userAddress)
    const tableData = this.generateTableRows(userLocks)
    const lockingStart = lockNECStore.staticParams.startTime
    const numPeriods = lockNECStore.staticParams.numLockingPeriods
    const periodLength = lockNECStore.staticParams.lockingPeriodLength

    const necTokenAddress = deployed.NectarToken
    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress)
    const necBalanceDisplay = helpers.fromWei(necBalance)

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


      console.log('batchTime', batchTime.toString())
      console.log('startTime', startTime.toString())
      console.log('nowTime', nowTime.toString())
      console.log('currentBatch', currentBatch.toString())
      console.log('currentBatchEndTime', currentBatchEndTime.toString())
      const timeUntilNextBatch = currentBatchEndTime.sub(nowTime)

      console.log('timeUntilNextBatch', timeUntilNextBatch.toString())

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
          </TableHeaderWrapper>
          <Table
            highlightTopRow
            columns={[
              { name: 'Period #', key: 'startPeriod', width: '15%', align: 'left' },
              { name: 'Amount', key: 'amount', width: '35%', align: 'right' },
              { name: 'Duration', key: 'duration', width: '25%', align: 'right' },
              { name: 'lockId', key: 'id', width: '20%', align: 'right' }
            ]}
            data={tableData}
          />
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={icon} text="Nectar" />
            <div>{necBalanceDisplay}</div>
          </ActionsHeader>
          {this.SidePanel()}
        </ActionsWrapper>
      </LockNECWrapper >
    )
  }
}

export default LockNEC
