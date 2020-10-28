import styled from 'styled-components'

export const LockingPeriodSelectorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--inactive-text);
  margin: 20px 24px 23px;
`

export const LockingPeriodTitle = styled.div`
  display: fex;
  flex-direction: row;
  justify-content: space-evenly;
`

export const LockingPeriodSelector = styled.div`
  display: flex;
  flex-direction: row;
  color: var(--inactive-header-text);
  margin-top: 12px;
`

export const LockingPeriodCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 34px;
  border: 1px solid var(--inactive-border);
  cursor: pointer;
`

export const ActiveLockingPeriodCell = styled(LockingPeriodCell)`
  color: var(--white-text);
  border: 1px solid #E2A907;
`

export const LockingPeriodStartCell = styled(LockingPeriodCell)`
  border-radius: 4px 0px 0px 4px;
  cursor: pointer;
`

export const LockingPeriodEndCell = styled(LockingPeriodCell)`
  border-radius: 0px 4px 4px 0px;
  cursor: pointer;
`
