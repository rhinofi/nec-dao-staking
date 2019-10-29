import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../LoadingCircle'
import { deployed } from 'config.json'
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root'

const PanelWrapper = styled.div`
`

export const MaxTokensText = styled.div`
display: flex;
font-weight: 600;
color: var(--action-button);
`

export const LockAmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px;
  font-weight: 600;
  color: var(--inactive-text);
  height: 64px;
`

export const LockAmountForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 18px;
  padding: 0px 20px 6px 20px;
  border-bottom: 1px solid var(--inactive-border);
  input {
    border: ${props => props.border || '1px solid #ccc'};
    font-size: 15px;
    line-height: 18px;
    color: var(--white-text);
    background: var(--background);
    border: none;
  }
`

const ReleaseableDateWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 24px;
  color: var(--inactive-text);
`

const ReleaseableDate = styled.div`
  color: var(--white-text);  
`

@inject('root')
@observer
class LockPanel extends React.Component<any, any>{
  constructor(props) {
    super(props)

    this.state = {
      rangeStart: props.rangeStart,
      releaseableDate: '12.04.2019'
    }
  }

  setRangeStart(value) {
    this.setState({ rangeStart: value })
  }

  setLockAmount(value) {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.amount = value
  }

  changeLockDuration(i) {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.duration = i
  }

  LockingPeriod = () => {
    const { lockNECStore, lockFormStore } = this.props.root as RootStore
    const { rangeStart } = this.state

    const periodsRemaining = lockNECStore.getPeriodsRemaining()
    const lockDuration = lockFormStore.duration

    let maxLockDuration = lockNECStore.staticParams.maxLockingBatches
    let numCells = 4

    if (periodsRemaining < 4) {
      numCells = periodsRemaining
    }

    if (periodsRemaining < maxLockDuration) {
      maxLockDuration = periodsRemaining
    }

    const cells: any[] = []
    for (let i = rangeStart; i <= rangeStart + numCells; i += 1) {
      if (i === lockDuration) {
        cells.push(<ActiveLockingPeriodCell key={`cell-${i}`}>{i}</ActiveLockingPeriodCell>)
      } else {
        cells.push(
          <LockingPeriodCell key={`cell-${i}`} onClick={() => { this.changeLockDuration(i) }}>
            {i}
          </LockingPeriodCell>
        )
      }
    }

    return (
      <LockingPeriodSelectorWrapper>
        <div>Lock Duration (Months)</div>
        <LockingPeriodSelector>
          <LockingPeriodStartCell onClick={() => {
            this.setRangeStart(rangeStart > 1 ? rangeStart - 1 : 1)
          }}
          >
            {'<'}
          </LockingPeriodStartCell>
          {cells}
          <LockingPeriodEndCell
            onClick={() => { this.setRangeStart(rangeStart + numCells < maxLockDuration ? rangeStart + 1 : rangeStart) }}
          >
            {'>'}
          </LockingPeriodEndCell>
        </LockingPeriodSelector>
      </LockingPeriodSelectorWrapper>
    )
  }

  Pending(values) {
    const { amount, releaseableDate, duration } = values
    const periodText = helpers.getPeriodText(duration)
    return (
      <LoadingCircle instruction={`Lock ${amount} NEC`} subinstruction={`${duration} ${periodText} - Unlock on ${releaseableDate}`} />
    )
  }

  LockForm(values) {
    const { amount, releaseableDate, buttonText, enabled, userBalance } = values
    return (<React.Fragment>
      {this.LockingPeriod()}
      <LockAmountWrapper>
        <div>Lock Amount</div>
        <LockAmountForm>
          <input type="text" name="name" placeholder="0" value={amount} onChange={e => this.setLockAmount(e.target.value)} />
          <MaxTokensText onClick={e => this.setLockAmount(userBalance)}>Max</MaxTokensText>
          <div>NEC</div>
        </LockAmountForm>
      </LockAmountWrapper>
      <ReleaseableDateWrapper>
        <div>Releasable</div>
        <ReleaseableDate>{releaseableDate}</ReleaseableDate>
      </ReleaseableDateWrapper>
      {
        enabled ? <ActiveButton onClick={() => { this.lockHandler() }}>{buttonText}</ActiveButton> :
          <InactiveButton>{buttonText}</InactiveButton>
      }

    </React.Fragment >)
  }

  async lockHandler() {
    const { lockNECStore, lockFormStore } = this.props.root as RootStore

    const amount = helpers.toWei(lockFormStore.amount)
    const duration = lockFormStore.duration
    const batchId = lockNECStore.getActiveLockingPeriod()

    await lockNECStore.lock(amount, duration, batchId)
    lockFormStore.resetForm()
  }

  render() {
    const { lockNECStore, lockFormStore, timeStore, tokenStore } = this.props.root as RootStore
    const { buttonText, pending, enabled, userAddress } = this.props
    const necTokanAddress = deployed.NectarToken

    // The release period is now + (batchTime * duration)
    const now = timeStore.currentTime
    const duration = lockFormStore.duration
    const amount = lockFormStore.amount

    const userBalance = helpers.fromWei(tokenStore.getBalance(necTokanAddress, userAddress))
    const releaseableTimestamp = lockNECStore.calcReleaseableTimestamp(now, duration)

    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)

    const values = {
      amount, releaseableDate, buttonText, enabled, userBalance, duration
    }

    return (
      <PanelWrapper>
        {pending ?
          this.Pending(values) :
          this.LockForm(values)
        }
      </PanelWrapper >
    )
  }
}

export default LockPanel
