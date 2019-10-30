import React from 'react'
import { observer, inject } from 'mobx-react'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../LoadingCircle'
import { deployed } from 'config.json'
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root'
import PanelExplainer from './PanelExplainer'
import { PanelWrapper, LockFormWrapper, ReleaseableDateWrapper, ReleaseableDate } from './LockPanel'
import Tooltip from '../Tooltip'
import { Lock } from 'types'
import { tooltip } from 'strings'

interface Props {
  buttonText: string;
  userAddress: string;
  enabled: boolean;
  pending: boolean;
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

  renderDurationSelector = () => {
    const { lockNECStore, extendLockFormStore, timeStore } = this.props.root as RootStore
    const { userAddress } = this.props

    let numCells = 4
    const { selectedLockId, duration, rangeStart } = extendLockFormStore
    const now = timeStore.currentTime

    const selectedLock = lockNECStore.getUserTokenLocks(userAddress).get(selectedLockId) as Lock
    const maxExtension = lockNECStore.calcMaxExtension(selectedLock.batchDuration)

    const isReleaseable = lockNECStore.isReleaseable(now, selectedLock)

    console.log(selectedLock)
    console.log(maxExtension)

    if (maxExtension <= 0) {
      return this.renderLockAtMaxDuration()
    }

    if (maxExtension < 4) {
      numCells = maxExtension
    }

    const cells: any[] = []
    for (let i = rangeStart; i <= rangeStart + numCells; i += 1) {
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
            this.setRangeStart(rangeStart > 1 ? rangeStart - 1 : 1)
          }}
          >
            {'<'}
          </LockingPeriodStartCell>
          {cells}
          <LockingPeriodEndCell
            onClick={() => { this.setRangeStart(rangeStart + numCells < maxExtension ? rangeStart + 1 : rangeStart) }}
          >
            {'>'}
          </LockingPeriodEndCell>
        </LockingPeriodSelector>
      </LockingPeriodSelectorWrapper >
    )
  }

  renderPending(values) {
    const { selectedLockId, releaseableDate, duration } = values
    const batchText = helpers.getBatchText(duration)
    return (
      <LoadingCircle instruction={`Extend Lock #${selectedLockId}`} subinstruction={`${duration} ${batchText} - Unlock on ${releaseableDate}`} />
    )
  }

  renderLockAtMaxDuration() {
    return <PanelExplainer text={tooltip.noUserLocks} tooltip={tooltip.lockTokenExplainer} />
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

  LockForm(values) {
    const { hasLocks, isLockSelected, releaseableDate, buttonText, enabled, isLockingEnded } = values

    if (isLockingEnded) {
      return this.renderLockingEnded()
    }

    if (!hasLocks) {
      return this.renderNoLocks()
    }

    if (!isLockSelected) {
      return this.renderNoLockSelected()
    }

    return (
      <React.Fragment>
        {this.renderDurationSelector()}
        <LockFormWrapper>
        </LockFormWrapper>
        <ReleaseableDateWrapper>
          <div>Releasable</div>
          <ReleaseableDate>{releaseableDate}</ReleaseableDate>
        </ReleaseableDateWrapper>
        {
          enabled ? <ActiveButton onClick={() => { this.extendLock() }}>{buttonText}</ActiveButton> :
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
    const { buttonText, pending, enabled, userAddress, hasLocks } = this.props
    const necTokanAddress = deployed.NectarToken

    // The release batch is now + (batchTime * duration)
    const now = timeStore.currentTime
    const { selectedLockId, duration, rangeStart } = extendLockFormStore

    // Also, if the user HAS no locks - we need to disable this form.
    // We need to set the default lockID appropriately - to one the user owns.

    const userBalance = helpers.fromWei(tokenStore.getBalance(necTokanAddress, userAddress))
    const releaseableTimestamp = lockNECStore.calcReleaseableTimestamp(now, duration)
    const isLockingStarted = lockNECStore.isLockingStarted()
    const isLockingEnded = lockNECStore.isLockingEnded()

    const isLockSelected = extendLockFormStore.isLockSelected

    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)



    const values = {
      selectedLockId, hasLocks, isLockSelected, releaseableDate, buttonText, enabled, userBalance, duration, isLockingEnded
    }

    return (
      <PanelWrapper>
        {pending ?
          this.renderPending(values) :
          this.LockForm(values)
        }
      </PanelWrapper >
    )
  }
}

export default ExtendLockPanel
