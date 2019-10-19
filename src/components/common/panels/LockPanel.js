import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import ProgressCircle from 'components/common/ProgressCircle'
import { CircleAndTextContainer, Instruction, SubInstruction, DisableButton } from './common'
import ActiveButton from 'components/common/buttons/ActiveButton'
import InactiveButton from 'components/common/buttons/InactiveButton'
import * as helpers from 'utils/helpers'

const PanelWrapper = styled.div`
`

const LockingPeriodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--inactive-text);
  margin: 24px;
`

const LockingPeriodSelector = styled.div`
  display: flex;
  flex-direction: row;
  color: var(--inactive-header-text);
  margin-top: 12px;
`

const LockingPeriodCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 34px;
  border: 1px solid var(--inactive-border);
`

const ActiveLockingPeriodCell = styled(LockingPeriodCell)`
  color: var(--white-text);
  border: 1px solid var(--active-border);
`

const LockingPeriodStartCell = styled(LockingPeriodCell)`
  border-radius: 4px 0px 0px 4px;
`

const LockingPeriodEndCell = styled(LockingPeriodCell)`
  border-radius: 0px 4px 4px 0px;
`

const LockAmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px;
  font-weight: 600;
  color: var(--inactive-text);
  height: 87px;
`

const LockAmountForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0px 20px 6px 20px;
  border-bottom: 1px solid var(--inactive-border);
  input {
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

const LockNECButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 34px;
  margin: 0px 24px;
  color: var(--inactive-text);
  border: 1px solid var(--border);
`

const Button = styled.div`
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

@inject('root')
@observer
class LockPanel extends React.Component {
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

  setLockAmount(e) {
    const { lockFormStore } = this.props.root
    lockFormStore.amount = e.target.value
  }

  changeLockDuration(i) {
    const { lockFormStore } = this.props.root
    lockFormStore.duration = i
  }

  LockingPeriod = () => {
    const { lockNECStore, lockFormStore } = this.props.root
    const { rangeStart } = this.state

    const maxLockDuration = lockNECStore.staticParams.maxLockingBatches
    const lockDuration = lockFormStore.duration

    const numCells = 4

    const cells = []
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

  Pending() {
    return (
      <React.Fragment>
        <CircleAndTextContainer>
          <ProgressCircle
            value={66} width={"45px"} height={"45px"}
            rotate
          />
          <Instruction>{'Lock NEC'}</Instruction>
        </CircleAndTextContainer>
      </React.Fragment >
    )
  }

  LockForm(values) {
    const { amount, releaseableDate, buttonText, enabled } = values
    return (<React.Fragment>
      {this.LockingPeriod()}
      <LockAmountWrapper>
        <div>Lock Amount</div>
        <LockAmountForm>
          <input type="text" name="name" placeholder="0" value={amount} onChange={e => this.setLockAmount(e)} />
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

    </React.Fragment>)
  }

  async lockHandler() {
    const { lockNECStore, lockFormStore } = this.props.root

    const amount = helpers.toWei(lockFormStore.amount)
    const duration = lockFormStore.duration
    const batchId = lockNECStore.getActiveLockingPeriod()

    await lockNECStore.lock(amount, duration, batchId)
    lockFormStore.resetForm()
  }

  render() {
    const { lockNECStore, lockFormStore, timeStore } = this.props.root
    const { buttonText, pending, enabled } = this.props

    // The release period is now + (lockingPeriodLength * duration)
    const now = timeStore.currentTime
    const duration = lockFormStore.duration

    const releaseableTimestamp = lockNECStore.calcReleaseableTimestamp(now, duration)
    const releaseableDate = helpers.timestampToDate(releaseableTimestamp)

    const amount = lockFormStore.amount

    return (
      <PanelWrapper>
        {pending ?
          this.Pending() :
          this.LockForm({ amount, releaseableDate, buttonText, enabled })
        }
      </PanelWrapper >
    )
  }
}

export default LockPanel
