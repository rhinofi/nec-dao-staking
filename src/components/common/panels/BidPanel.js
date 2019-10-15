import React from 'react'
import styled from 'styled-components'
import { inject, observer } from "mobx-react";
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

const DisableButton = styled(Button)`
  border: 1px solid var(--inactive-border);
  color: var(--inactive-header-text);
  background: none;
`

@inject('root')
@observer
class BidPanel extends React.Component {
  constructor(props) {
    super(props)
  }

  setBidAmount(e) {
    const { bidFormStore } = this.props.root
    bidFormStore.setBidAmount(helpers.toWei(e.target.value))
  }

  async bid() {
    const { bidFormStore, bigGENStore } = this.props.root

    const weiValue = helpers.toWei(bidFormStore.bidAmount)
    const currentAuction = bigGENStore.getActiveAuction()

    await bigGENStore.bid(weiValue, currentAuction)
  }

  render() {
    const { buttonText } = this.props
    const { bidFormStore, tokenStore, bigGENStore, providerStore } = this.props.root

    return (
      <PanelWrapper>
        <LockAmountWrapper>
          <div>Bid Amount</div>
          <LockAmountForm>
            <input type="text" name="name" value={bidFormStore.bidAmount} onChange={e => this.setBidAmount(e)} />
            <div>GEN</div>
          </LockAmountForm>
        </LockAmountWrapper>
        <Button
          onClick={this.bid()}
        >
          {buttonText}
        </Button>
      </PanelWrapper>
    )
  }
}

export default BidPanel
