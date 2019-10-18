import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import ProgressCircle from 'components/common/ProgressCircle'
import { CircleAndTextContainer, Instruction, SubInstruction, DisableButton } from './common'
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
    const lockDuration = lockFormStore.duration

    const cells = []
    for (let i = rangeStart; i < rangeStart + 5; i += 1) {
      if (i === lockDuration) {
        cells.push(<ActiveLockingPeriodCell>{i}</ActiveLockingPeriodCell>)
      } else {
        cells.push(
          <LockingPeriodCell onClick={() => { this.changeLockDuration(i) }}>
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
            this.setRangeStart(rangeStart > 0 ? rangeStart - 1 : 0)
          }}
          >
            {'<'}
          </LockingPeriodStartCell>
          {cells}
          <LockingPeriodEndCell
            onClick={() => { this.setRangeStart(rangeStart + 1) }}
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
          <Instruction>{'Instruction'}</Instruction>
          <SubInstruction>{'Sub Instruction'}</SubInstruction>
        </CircleAndTextContainer>
        <DisableButton>{'Button'}</DisableButton>
      </React.Fragment >
    )
  }

  LockForm(values) {
    const { amount, releaseableDate, buttonText } = values
    return (<div>
      {this.LockingPeriod()}
      <LockAmountWrapper>
        <div>Lock Amount</div>
        <LockAmountForm>
          <input type="text" name="name" value={amount} onChange={e => this.setLockAmount(e)} />
          <div>NEC</div>
        </LockAmountForm>
      </LockAmountWrapper>
      <ReleaseableDateWrapper>
        <div>Releasable</div>
        <ReleaseableDate>{releaseableDate}</ReleaseableDate>
      </ReleaseableDateWrapper>
      <Button onClick={() => { this.lockHandler() }}>
        {buttonText}
      </Button>
    </div>)
  }

  lockHandler() {
    const { lockNECStore, lockFormStore } = this.props.root
    const { buttonText } = this.props
    const { releaseableDate, rangeStart } = this.state

    const amount = helpers.toWei(lockFormStore.amount)
    const duration = lockFormStore.duration
    const batchId = lockNECStore.getActiveLockingPeriod()

    lockNECStore.lock(amount, duration, batchId)
  }

  render() {
    const { lockNECStore, lockFormStore } = this.props.root
    const { buttonText, pending } = this.props
    const { releaseableDate, rangeStart } = this.state

    console.log('lock Pending?', pending)
    const amount = lockFormStore.amount

    return (
      <PanelWrapper>
        {pending ?
          this.Pending() :
          this.LockForm({ amount, releaseableDate, buttonText })
        }
      </PanelWrapper >
    )
  }
}

export default LockPanel
