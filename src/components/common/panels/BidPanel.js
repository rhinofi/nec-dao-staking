import React from 'react'
import styled from 'styled-components'
import { inject, observer } from "mobx-react";
import * as helpers from 'utils/helpers'
import ProgressCircle from 'components/common/ProgressCircle'
import { CircleAndTextContainer, Instruction, SubInstruction } from './common'
import InactiveButton from 'components/common/buttons/InactiveButton'
import ActiveButton from 'components/common/buttons/ActiveButton'
import LoadingCircle from '../LoadingCircle';
const PanelWrapper = styled.div`
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

@inject('root')
@observer
class BidPanel extends React.Component {
  setBidAmount(e) {
    const { bidFormStore } = this.props.root
    bidFormStore.setBidAmount(e.target.value)
  }

  async bid() {
    const { bidFormStore, bidGENStore } = this.props.root
    if (!bidFormStore.bidAmount) {
      return
    }
    const weiValue = helpers.toWei(bidFormStore.bidAmount)
    const currentAuction = bidGENStore.getActiveAuction()

    await bidGENStore.bid(weiValue, currentAuction)
    bidFormStore.resetForm()
  }

  Pending() {
    return (
      <React.Fragment>
        <LoadingCircle instruction="Bid GEN" />
      </React.Fragment >
    )
  }

  BidForm(bidAmount, buttonText, auctionsEnded, auctionsStarted) {
    const actionEnabled = auctionsStarted && !auctionsEnded
    return (
      <React.Fragment>
        <LockAmountWrapper>
          <div>Bid Amount</div>
          <LockAmountForm>
            <input type="text" name="name" value={bidAmount} onChange={e => this.setBidAmount(e)} />
            <div>GEN</div>
          </LockAmountForm>
        </LockAmountWrapper>
        {actionEnabled ?
          (<ActiveButton
            onClick={() => { this.bid() }}>
            {buttonText}
          </ActiveButton>)
          :
          (<InactiveButton>
            {buttonText}
          </InactiveButton>)
        }

      </React.Fragment>
    )
  }

  render() {
    const { bidGENStore, bidFormStore } = this.props.root
    const { buttonText } = this.props
    const auctionsEnded = bidGENStore.areAuctionsOver()
    const auctionsStarted = bidGENStore.haveAuctionsStarted()
    const pending = bidGENStore.isBidActionPending()
    return (
      <PanelWrapper>
        {
          pending ?
            this.Pending() :
            this.BidForm(bidFormStore.bidAmount, buttonText, auctionsEnded, auctionsStarted)
        }
      </PanelWrapper>
    )
  }
}

export default BidPanel
