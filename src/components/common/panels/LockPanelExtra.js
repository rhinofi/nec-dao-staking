import React from 'react'
import styled from 'styled-components'

import * as contractService from 'core/services/contractService'
import * as providerService from 'core/services/providerService'
import * as erc20Service from 'core/services/erc20Service'
import * as lockingService from 'core/services/continuousLocking4RepService'
import * as numberLib from 'core/libs/lib-number-helpers'

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

const DisableButton = styled(Button)`
  border: 1px solid var(--inactive-border);
  color: var(--inactive-header-text);
  background: none;
`

const LockPanelExtra = ({
  currentPeriod,
  setCurrentPeriod,
  rangeStart,
  setRangeStart,
  buttonText,
  getToken,
  getSpender,
  onEnable }) => {

  const [enabled, setEnabled] = React.useState(undefined)
  const [pending, setPending] = React.useState(false)
  const [lockId, setLockId] = React.useState(1)
  const [periodsToExtend, setPeriodsToExtend] = React.useState(0)

  const changeLockId = (event) => {
    console.log('new lock Id', event.target.value)
    setLockId(event.target.value)
  }

  const changePeriodsToExtend = (event) => {
    console.log('new extension length', event.target.value)
    setPeriodsToExtend(event.target.value)
  }

  return (
    <PanelWrapper>
      <LockAmountWrapper>
        <div>Extend Lock</div>
        <LockAmountForm>
          <div>LockId</div>
          <input type="text" name="name" value={lockId} onChange={changeLockId} />

          <div>PeriodsToExtend</div>
          <input type="text" name="name" value={periodsToExtend} onChange={changePeriodsToExtend} />
        </LockAmountForm>
      </LockAmountWrapper>
      <Button
        onClick={async () => {
          setPending(true)
          const provider = await providerService.getProvider()

          try {
            await lockingService.extendLock(
              provider, lockId, periodsToExtend, currentPeriod
            )
          } catch (e) {
            console.log(e)
          }

          setPending(false)
        }}
      >
        {buttonText}
      </Button>
    </PanelWrapper>
  )
}

export default LockPanelExtra
