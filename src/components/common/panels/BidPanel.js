import React from 'react'
import styled from 'styled-components'
import { inject, observer } from "mobx-react";
import * as helpers from 'utils/helpers'
import { MaxTokensText } from './LockPanel'
import InactiveButton from 'components/common/buttons/InactiveButton'
import ActiveButton from 'components/common/buttons/ActiveButton'
import LoadingCircle from '../LoadingCircle';
import * as deployed from 'deployed'

const PanelWrapper = styled.div`
`

const BidWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px 42px;
  font-weight: 500;
  color: var(--inactive-text);
`

const BidForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 18px;
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

const PanelText = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.4px;
  padding: 24px 0px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--faint-divider);
`

@inject('root')
@observer
class BidPanel extends React.Component {
  setBidAmount(value) {
    const { bidFormStore } = this.props.root
    bidFormStore.setBidAmount(value)
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
    const { bidGENStore, bidFormStore } = this.props.root
    const currentAuction = bidGENStore.getActiveAuction()
    const timeUntilNextAuction = bidGENStore.getTimeUntilNextAuction()
    const timeText = helpers.getSecondsText(timeUntilNextAuction)
    const amount = bidFormStore.bidAmount

    return (
      <React.Fragment>
        <LoadingCircle instruction={`Bid ${amount} GEN`} subinstruction={`Auction ${currentAuction} - Ends in ${timeText}`} />
      </React.Fragment >
    )
  }

  BidForm(bidAmount, buttonText, auctionsEnded, auctionsStarted, userBalance) {
    const actionEnabled = auctionsStarted && !auctionsEnded
    return (
      <React.Fragment>
        <BidWrapper>
          <PanelText>
            GEN is the native DAOstack token, primarily used for prediction markets and boosting proposals.
          </PanelText>
          <div>Bid Amount</div>
          <BidForm>
            <input type="text" name="name" placeholder="0" value={bidAmount} onChange={e => this.setBidAmount(e.target.value)} />
            <MaxTokensText onClick={e => this.setBidAmount(userBalance)}>Max</MaxTokensText>
            <div>GEN</div>
          </BidForm>
        </BidWrapper>
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
    const { bidGENStore, bidFormStore, tokenStore } = this.props.root
    const { buttonText, userAddress } = this.props
    const auctionsEnded = bidGENStore.areAuctionsOver()
    const auctionsStarted = bidGENStore.haveAuctionsStarted()
    const userBalance = helpers.fromWei(tokenStore.getBalance(deployed.GenToken, userAddress))
    const pending = bidGENStore.isBidActionPending()
    return (
      <PanelWrapper>
        {
          pending ?
            this.Pending() :
            this.BidForm(bidFormStore.bidAmount, buttonText, auctionsEnded, auctionsStarted, userBalance)
        }
      </PanelWrapper>
    )
  }
}

export default BidPanel
