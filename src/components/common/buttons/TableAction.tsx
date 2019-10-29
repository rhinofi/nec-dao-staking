import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import { RootStore } from 'stores/Root'

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

export const actions = {
    EXTEND_LOCK: 0,
    RELEASE: 1
}

@inject('root')
@observer
class TableAction extends React.Component<any, any>{

    extendLock(lockId, periodsToExtend, batchId) {
        const { lockNECStore } = this.props.root as RootStore
        lockNECStore.extendLock(lockId, periodsToExtend, batchId)
    }

    release(beneficiary, lockId) {
        const { lockNECStore } = this.props.root as RootStore
        lockNECStore.release(beneficiary, lockId)
    }

    renderReleaseButton(buttonText, actionParams) {
        const { beneficiary, lockId } = actionParams

        return (<div onClick={() => { this.release(beneficiary, lockId) }}>{buttonText}</div>)
    }

    renderExtendLockButton(buttonText, actionParams) {
        const { lockId, periodsToExtend, batchId } = actionParams

        return (<div onClick={() => { this.extendLock(lockId, periodsToExtend, batchId) }}>{buttonText}</div>)
    }

    renderActionLink(action, buttonText, actionParams) {
        if (action === actions.EXTEND_LOCK) {
            return this.renderExtendLockButton(buttonText, actionParams)
        } else if (action === actions.RELEASE) {
            return this.renderReleaseButton(buttonText, actionParams)
        }
    }

    render() {
        const { action, buttonText, actionParams } = this.props

        return (
            <React.Fragment>
                {this.renderActionLink(action, buttonText, actionParams)}
            </React.Fragment>
        )
    }
}

export default TableAction
