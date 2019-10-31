import React from 'react'
import { observer, inject } from 'mobx-react'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle'
import { deployed } from 'config.json'
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root'
import PanelExplainer from './PanelExplainer'
import { PanelWrapper, LockFormWrapper, ReleaseableDateWrapper, ReleaseableDate } from './LockPanel'
import Tooltip from '../common/Tooltip'
import { Lock } from 'types'
import { tooltip } from 'strings'

interface Props {
  buttonText: string;
  userAddress: string;
  lockingEnabled: boolean;
  pending: boolean;
}

interface FormState {
  existingDuration: number;
  duration: number;
  rangeStart: number;
  numCells: number;
  maxDuration: number;
}

@inject('root')
@observer
class ExtendLockPanel extends React.Component<any, any>{
  constructor(props) {
    super(props)

    this.state = {
      releaseableDate: '12.04.2019',
    }
  }

  setRangeStart(value) {
    const { extendLockFormStore } = this.props.root as RootStore
    extendLockFormStore.setRangeStart(value)
  }

  changeSelectedDuration(value) {
    const { extendLockFormStore } = this.props.root as RootStore
    extendLockFormStore.duration = value
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

  calcMaxDuration(formState: FormState) {
    const { existingDuration, maxDuration } = formState
    return Math.max(0, maxDuration - existingDuration)
  }


  renderDurationSelector = (renderData: RenderData) => {
    const { lockNECStore, extendLockFormStore } = this.props.root as RootStore
    const { rangeStart, duration } = extendLockFormStore

    const lock = renderData.selectedLock as Lock

    let formState: FormState = {
      existingDuration: lock.batchDuration,
      duration: duration,
      rangeStart: rangeStart,
      numCells: 5,
      maxDuration: lockNECStore.staticParams.maxLockingBatches,
    }

    formState.maxDuration = this.calcMaxDuration(formState)
    const cellsToRender = this.cellsToRender(formState)
    const maxIndex = rangeStart + cellsToRender

    const cells: any[] = []
    for (let i = rangeStart; i < maxIndex; i += 1) {
      if (i === duration) {
        cells.push(<ActiveLockingPeriodCell key={`cell-${i}`}>{i}</ActiveLockingPeriodCell>)
      } else {
        cells.push(
          <LockingPeriodCell key={`cell-${i}`} onClick={() => { this.changeSelectedDuration(i) }}>
            {i}
          </LockingPeriodCell>
        )
      }
    }

    return (
      <LockingPeriodSelectorWrapper>
        <div>Extend Lock (Months)
        <Tooltip title={''} content="You can extend the duration of one of your current token locks to gain more REP over a longer batch. The total duration still cannot exceed 12 months, however." position="right top" />
        </div>

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
      </LockingPeriodSelectorWrapper >
    )
  }

  renderPending(renderData: RenderData) {
    const { selectedLockId, releaseableDate, duration } = renderData
    const batchText = helpers.getBatchText(duration)
    return (
      <LoadingCircle instruction={`Extend Lock #${selectedLockId}`} subinstruction={`${duration} ${batchText} - Unlock on ${releaseableDate}`} />
    )
  }

  renderLockAtMaxDuration() {
    return <PanelExplainer text={tooltip.lockAtMaxDuration} tooltip={tooltip.lockAtMaxDurationTooltip} />
  }

  renderNoLocks() {
    return <PanelExplainer text={tooltip.noUserLocks} tooltip={tooltip.lockTokenExplainer} />
  }

  renderNoLockSelected() {
    return <PanelExplainer text={tooltip.extendLockInstruction} tooltip={tooltip.extendLockExplainer} />
  }

  renderLockingEnded() {
    return <PanelExplainer text={tooltip.lockingEndedLockInstruction} tooltip={tooltip.lockingEndedLockExplainer_tab2} />
  }

  renderAlreadyExpired() {
    return <PanelExplainer text={tooltip.lockAlreadyExpired} tooltip={tooltip.lockAlreadyExpiredTooltip} />
  }

  renderAlreadyReleased() {
    return <PanelExplainer text={tooltip.lockAlreadyReleased} tooltip={tooltip.lockAlreadyReleasedTooltip} />
  }

  LockForm(renderData: RenderData) {
    const { hasLocks, isLockSelected, releaseableDate, buttonText, isLockingStarted, isLockingEnded, isReleaseable, maxExtension, isReleased } = renderData

    const lockingEnabled = isLockingStarted && !isLockingEnded && !isReleaseable && maxExtension > 0

    if (isLockingEnded) {
      return this.renderLockingEnded()
    }

    if (!hasLocks) {
      return this.renderNoLocks()
    }

    if (!isLockSelected) {
      return this.renderNoLockSelected()
    }

    if (isReleased) {
      return this.renderAlreadyReleased()
    }

    if (isReleaseable) {
      return this.renderAlreadyExpired()
    }

    if (maxExtension <= 0) {
      return this.renderLockAtMaxDuration()
    }

    return (
      <React.Fragment>
        {this.renderDurationSelector(renderData)}
        <LockFormWrapper>
        </LockFormWrapper>
        <ReleaseableDateWrapper>
          <div>Releasable</div>
          <ReleaseableDate>{releaseableDate}</ReleaseableDate>
        </ReleaseableDateWrapper>
        {
          lockingEnabled ? <ActiveButton onClick={() => { this.extendLock() }}>{buttonText}</ActiveButton> :
            <InactiveButton>{buttonText}</InactiveButton>
        }
      </React.Fragment >)
  }

  async extendLock() {
    const { lockNECStore, extendLockFormStore } = this.props.root as RootStore

    const { selectedLockId, duration } = extendLockFormStore
    const batchId = lockNECStore.getActiveLockingBatch()

    await lockNECStore.extendLock(selectedLockId, duration, batchId)
    extendLockFormStore.resetForm()
  }

  render() {
    const { lockNECStore, extendLockFormStore, timeStore, tokenStore } = this.props.root as RootStore
    const { buttonText, pending, userAddress, hasLocks } = this.props
    const necTokenAddress = deployed.NectarToken

    // The release batch is now + (batchTime * duration)
    const now = timeStore.currentTime
    const { selectedLockId, duration, rangeStart } = extendLockFormStore

    // Also, if the user HAS no locks - we need to disable this form.
    // We need to set the default lockID appropriately - to one the user owns.

    const userBalance = helpers.fromWei(tokenStore.getBalance(necTokenAddress, userAddress))
    const releaseableTimestamp = lockNECStore.calcReleaseableTimestamp(now, duration)
    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()
    const isLockSelected = extendLockFormStore.isLockSelected
    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)


    let renderData: RenderData = {
      selectedLockId,
      isLockSelected,
      isLockingStarted,
      isLockingEnded,
      hasLocks,
      buttonText,
      duration,
      releaseableTimestamp,
      releaseableDate,
      userBalance,
      rangeStart,
      maxExtension: 0,
      isReleaseable: false,
      isReleased: false,
    }

    if (isLockSelected) {
      renderData.selectedLock = lockNECStore.getUserTokenLocks(userAddress).get(selectedLockId) as Lock
      renderData.maxExtension = lockNECStore.calcMaxExtension(renderData.selectedLock.batchDuration)
      renderData.isReleaseable = lockNECStore.isReleaseable(now, renderData.selectedLock)
      renderData.isReleased = renderData.selectedLock.released
    }

    return (
      <PanelWrapper>
        {pending ?
          this.renderPending(renderData) :
          this.LockForm(renderData)
        }
      </PanelWrapper >
    )
  }
}

interface RenderData {
  selectedLock?: Lock;
  selectedLockId: string;
  maxExtension: number;
  isLockSelected: boolean;
  isLockingStarted: boolean;
  isLockingEnded: boolean;
  hasLocks: boolean;
  buttonText: string;
  duration: number;
  releaseableTimestamp: number;
  userBalance: string;
  releaseableDate: string;
  isReleaseable: boolean;
  rangeStart: number;
  isReleased: boolean;
}

export default ExtendLockPanel
