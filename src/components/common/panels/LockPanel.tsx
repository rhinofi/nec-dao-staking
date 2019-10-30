import React from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { observer, inject } from 'mobx-react'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../LoadingCircle'
import { deployed } from 'config.json'
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root'
import PanelExplainer from './PanelExplainer'
import { tooltip } from 'strings'

export const PanelWrapper = styled.div`
`

export const LockFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px;
  font-weight: 600;
  color: var(--inactive-text);
  height: 64px;
`

export const LockAmountWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const MaxButton = styled.div`
  background: rgba(101, 102, 251, 0.5);
  width: 12px;
  height: 12px;
  border-radius: 7px;
  margin-top: 3px;
  cursor: pointer;
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

export const ReleaseableDateWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 24px;
  color: var(--inactive-text);
`

export const ReleaseableDate = styled.div`
  color: var(--white-text);  
`

interface RenderData {
  amount;
  releaseableDate;
  buttonText;
  enabled;
  userBalance;
  duration;
  pending;
  isLockingEnded;
  isLockingStarted;
}

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


  renderDurationSelector = () => {
    const { lockNECStore, lockFormStore } = this.props.root as RootStore
    const { rangeStart } = this.state

    const activeBatch = lockNECStore.getActiveLockingBatch()

    const batchesRemaining = lockNECStore.getBatchesRemaining()
    const lockDuration = lockFormStore.duration

    let maxLockDuration = lockNECStore.staticParams.maxLockingBatches
    let numCells = 4

    if (batchesRemaining < 4) {
      numCells = batchesRemaining
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

  renderPending(renderData: RenderData) {
    const { amount, releaseableDate, duration } = renderData
    const batchText = helpers.getBatchText(duration)
    return (
      <LoadingCircle instruction={`Lock ${amount} NEC`} subinstruction={`${duration} ${batchText} - Unlock on ${releaseableDate}`} />
    )
  }

  renderLockingNotStarted() {
    return <PanelExplainer text={tooltip.lockingNotStarted} tooltip={tooltip.lockTokenExplainer} />
  }

  renderLockingEnded() {
    return <PanelExplainer text={tooltip.lockingEndedLockInstruction} tooltip={tooltip.lockingEndedLockExplainer} />
  }

  renderLockForm(renderData: RenderData) {
    const { amount, releaseableDate, buttonText, enabled, userBalance, isLockingEnded, isLockingStarted } = renderData

    if (!isLockingStarted) {
      return this.renderLockingNotStarted()
    }

    if (isLockingEnded) {
      return this.renderLockingEnded()
    }

    return (<React.Fragment>
      {this.renderDurationSelector()}
      <LockFormWrapper>
        <LockAmountWrapper>
          <div>Lock Amount</div>
          <Popup
            trigger={<MaxButton onClick={e => this.setLockAmount(userBalance)} />}
            position="top center"
            on="hover"
          >
            <div>
              <div>Set max available amount</div>
            </div>
          </Popup>
        </LockAmountWrapper>
        <LockAmountForm>
          <input type="text" name="name" placeholder="0" value={amount} onChange={e => this.setLockAmount(e.target.value)} />
          <div>NEC</div>
        </LockAmountForm>
      </LockFormWrapper>
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
    const batchId = lockNECStore.getActiveLockingBatch()

    await lockNECStore.lock(amount, duration, batchId)
    lockFormStore.resetForm()
  }

  render() {
    const { lockNECStore, lockFormStore, timeStore, tokenStore } = this.props.root as RootStore
    const { buttonText, pending, enabled, userAddress } = this.props
    const necTokanAddress = deployed.NectarToken

    // The release batch is now + (batchTime * duration)
    const now = timeStore.currentTime
    const duration = lockFormStore.duration
    const amount = lockFormStore.amount

    const userBalance = helpers.fromWei(tokenStore.getBalance(necTokanAddress, userAddress))
    const releaseableTimestamp = lockNECStore.calcReleaseableTimestamp(now, duration)

    const isLockingStarted = lockNECStore.isLockingStarted
    const isLockingEnded = lockNECStore.isLockingEnded

    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)

    const renderData: RenderData = {
      amount, releaseableDate, buttonText, enabled, userBalance, duration, isLockingStarted, isLockingEnded, pending
    }

    return (
      <PanelWrapper>
        {pending ?
          this.renderPending(renderData) :
          this.renderLockForm(renderData)
        }
      </PanelWrapper >
    )
  }
}

export default LockPanel
