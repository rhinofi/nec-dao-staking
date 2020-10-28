import React from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { observer, inject } from 'mobx-react'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle'
import { deployed } from 'config.json'
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell, LockingPeriodTitle } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root'
import PanelExplainer from './PanelExplainer'
import { tooltip } from 'strings'
import Tooltip from 'components/common/Tooltip'
import { PanelWrapper, ValidationError, AmountForm, AmountLabelWrapper, MaxButton } from 'components/common/Panel'
import BigNumber from 'bignumber.js'

export const LockFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px;
  font-weight: 600;
  color: var(--inactive-text);
  height: 64px;
`
const ButtonWrapper = styled.div`
border: 1px solid #E2A907;
padding: 10px;
`
const CellBorder = styled.div`
border: 1px solid #E2A907;
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
  amount: string;
  releaseableDate;
  buttonText;
  enabled;
  userBalance;
  duration;
  pending;
  isLockingEnded;
  isLockingStarted;
}

interface FormState {
  amount: string;
  duration: number;
  rangeStart: number;
  numCells: number;
  maxDuration: number;
}

@inject('root')
@observer
class LockPanel extends React.Component<any, any>{
  renderData = {} as RenderData

  setRangeStart(value) {
    this.setState({ rangeStart: value })
  }

  setLockAmount(value) {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.amount = value
    lockFormStore.setInputTouched(true)
    this.setFormError()
  }

  changeLockDuration(i) {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.duration = i
  }

  decrementRange = (formState: FormState) => {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.rangeStart = formState.rangeStart - 1 > 1 ? formState.rangeStart - 1 : 1
  }

  incrementRange = (formState: FormState) => {
    const { lockFormStore } = this.props.root as RootStore
    lockFormStore.rangeStart = formState.rangeStart + 1 <= formState.maxDuration - formState.numCells + 1 ? formState.rangeStart + 1 : formState.rangeStart
  }

  cellsToRender(formState: FormState): number {
    const { maxDuration, numCells } = formState
    return maxDuration >= numCells ? numCells : maxDuration
  }

  calcMaxDuration() {
    const { lockNECStore } = this.props.root as RootStore
    const batchesRemaining = lockNECStore.getBatchesRemaining()
    const maxDuration = lockNECStore.staticParams.maxLockingBatches

    return Math.max(0, batchesRemaining < maxDuration ? batchesRemaining : maxDuration)
  }

  setFormError() {
    const { lockFormStore } = this.props.root as RootStore
    const { userBalance } = this.renderData
    const amount = lockFormStore.amount
    const checkValidity = helpers.isValidTokenAmount(amount, userBalance, 'lock')

    lockFormStore.setErrorStatus(checkValidity.displayError)
    lockFormStore.setErrorMessage(checkValidity.errorMessage)
    return checkValidity.isValid
  }

  renderDurationSelector = () => {
    const { lockNECStore, lockFormStore } = this.props.root as RootStore
    const { rangeStart, duration, amount } = lockFormStore

    let formState: FormState = {
      amount: amount,
      duration: duration,
      rangeStart: rangeStart,
      numCells: 5,
      maxDuration: lockNECStore.staticParams.maxLockingBatches,
    }

    formState.maxDuration = this.calcMaxDuration()
    const cellsToRender = this.cellsToRender(formState)
    const maxIndex = rangeStart + cellsToRender

    const cells: any[] = []
    for (let i = rangeStart; i < maxIndex; i += 1) {
      if (i === duration) {
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
        <LockingPeriodTitle>Lock Duration (Months) <Tooltip title={''} content={tooltip.lockTokenExplainer} position="bottom center" /></LockingPeriodTitle>
        <LockingPeriodSelector> 
          <LockingPeriodStartCell onClick={() => {
            this.decrementRange(formState)
          }}
          >
            {'<'}
          </LockingPeriodStartCell>
          {cells}
          <LockingPeriodEndCell
            onClick={() => { this.incrementRange(formState) }}
          >
            {'>'}
          </LockingPeriodEndCell>
        </LockingPeriodSelector>
      </LockingPeriodSelectorWrapper>
    )
  }

  renderPending() {
    const { amount, releaseableDate, duration } = this.renderData
    const batchText = helpers.getBatchText(duration)

    const tokenValue = helpers.toWeiValue(new BigNumber(amount))
    const weiValue = helpers.tokenDisplay(tokenValue)

    return (
      <LoadingCircle instruction={`Locking ${weiValue} NEC`} subinstruction={`${duration} ${batchText} - Unlock on ${releaseableDate}`} />
    )
  }

  renderLockingNotStarted() {
    return <PanelExplainer text={tooltip.lockingNotStarted} tooltip={tooltip.lockTokenExplainer} />
  }

  renderLockingEnded() {
    return <PanelExplainer text={tooltip.lockingEndedLockInstruction} tooltip={tooltip.lockingEndedLockExplainer} />
  }

  renderLockForm() {
    const { lockFormStore } = this.props.root as RootStore
    const { amount, releaseableDate, buttonText, enabled, userBalance, isLockingEnded, isLockingStarted } = this.renderData
    const { touched, error, errorMessage } = lockFormStore.tokenInput

    if (!isLockingStarted) {
      return this.renderLockingNotStarted()
    }

    if (isLockingEnded) {
      return this.renderLockingEnded()
    }

    return (<React.Fragment>
      {this.renderDurationSelector()}
      <LockFormWrapper>
        <AmountLabelWrapper>
          <div>Lock Amount</div>
          <Popup
            trigger={<MaxButton onClick={e => this.setLockAmount(userBalance)} />}
            position="left center"
            on="hover"
          >
            <div>
              <div>Set max available amount</div>
            </div>
          </Popup>
        </AmountLabelWrapper>
        <AmountForm>
          <input type="text" name="name" placeholder="0" value={amount} onChange={e => this.setLockAmount(e.target.value)} />
          <div>NEC</div>
        </AmountForm>
        {
          touched && error ?
            <ValidationError>{errorMessage}</ValidationError>
            :
            <React.Fragment></React.Fragment>
        }
      </LockFormWrapper>
      <ReleaseableDateWrapper>
        <div>Releasable</div>
        <ReleaseableDate>{releaseableDate}</ReleaseableDate>
      </ReleaseableDateWrapper>
      {
        enabled ? <ActiveButton onClick={() => { this.lockHandler() }}><ButtonWrapper>{buttonText}</ButtonWrapper></ActiveButton> :
          <InactiveButton>{buttonText}</InactiveButton>
      }

    </React.Fragment >)
  }

  async lockHandler() {
    const { lockNECStore, lockFormStore } = this.props.root as RootStore
    const isValid = this.setFormError()

    if (isValid) {
      const amount = helpers.toWei(lockFormStore.amount)
      const duration = lockFormStore.duration
      const batchId = lockNECStore.getActiveLockingBatch()

      await lockNECStore.lock(amount, duration, batchId)
      lockFormStore.resetData()
    }
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

    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()

    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)

    this.renderData = {
      amount, releaseableDate, buttonText, enabled, userBalance, duration, isLockingStarted, isLockingEnded, pending
    }

    return (
      <PanelWrapper>
        {pending ?
          this.renderPending() :
          this.renderLockForm()
        }
      </PanelWrapper >
    )
  }
}

export default LockPanel
