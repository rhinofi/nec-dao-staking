import React from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { inject, observer } from "mobx-react";
import * as helpers from 'utils/helpers'
import { PanelText } from 'components/common'
import InactiveButton from 'components/common/buttons/InactiveButton'
import ActiveButton from 'components/common/buttons/ActiveButton'
import LoadingCircle from '../common/LoadingCircle'
import { deployed } from 'config.json'
import { RootStore } from 'stores/Root'
import { PanelWrapper, AmountLabelWrapper, ValidationError, MaxButton, AmountForm } from 'components/common/Panel'

const BidWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px 42px;
  font-weight: 500;
  color: var(--inactive-text);
`

interface RenderData {
  userAddress: string,
  bidAmount: string,
  buttonText: string,
  auctionsEnded: boolean,
  auctionsStarted: boolean,
  userBalance: string,
}

@inject('root')
@observer
class BidPanel extends React.Component<any, any>{
  renderData = {} as RenderData

  setBidAmount(value) {
    const { bidFormStore } = this.props.root as RootStore
    bidFormStore.setBidAmount(value)
    bidFormStore.setInputTouched(true)
    this.setFormError()
  }

  setFormError() {
    const { bidFormStore } = this.props.root as RootStore
    const { userBalance } = this.renderData
    const bidAmount = bidFormStore.bidAmount
    const checkValidity = helpers.isValidTokenAmount(bidAmount, userBalance, 'bid')

    bidFormStore.setErrorStatus(!checkValidity.isValid)
    bidFormStore.setErrorMessage(checkValidity.errorMessage)
    return checkValidity.isValid
  }

  async bid() {
    const { bidFormStore, bidGENStore } = this.props.root as RootStore
    const isValid = this.setFormError()

    if (isValid) {
      const weiValue = helpers.toWei(bidFormStore.bidAmount)
      const currentAuction = bidGENStore.getActiveAuction()

      await bidGENStore.bid(weiValue, currentAuction)
      bidFormStore.resetData()
    }
  }

  Pending() {
    const { bidGENStore } = this.props.root as RootStore
    const { bidAmount } = this.renderData
    const currentAuction = bidGENStore.getActiveAuction()
    const timeUntilNextAuction = bidGENStore.getTimeUntilNextAuction()
    const timeText = helpers.getSecondsText(timeUntilNextAuction)

    return (
      <React.Fragment>
        <LoadingCircle instruction={`Bid ${bidAmount} GEN`} subinstruction={`Auction ${currentAuction + 1} - Ends in ${timeText}`} />
      </React.Fragment >
    )
  }

  BidForm() {
    const { bidFormStore } = this.props.root as RootStore
    const { buttonText, auctionsEnded, auctionsStarted, userBalance } = this.renderData
    const actionEnabled = auctionsStarted && !auctionsEnded
    const bidAmount = bidFormStore.bidAmount
    const { touched, error, errorMessage } = bidFormStore.tokenInput

    console.log({
      bidAmount,
      userBalance,
      touched,
      error,
      errorMessage
    })

    return (
      <React.Fragment>
        <BidWrapper>
          <PanelText>
            GEN is the native DAOstack token, primarily used for prediction markets and boosting proposals.
          </PanelText>
          <AmountLabelWrapper>
            <div>Bid Amount</div>
            <Popup
              trigger={<MaxButton onClick={e => this.setBidAmount(userBalance)} />}
              position="top center"
              on="hover"
            >
              <div>
                <div>Set max available amount</div>
              </div>
            </Popup>
          </AmountLabelWrapper>
          <AmountForm className={touched && error ? "invalid-border" : ""}>
            <input type="text" name="name" placeholder="0" value={bidAmount} onChange={e => this.setBidAmount(e.target.value)} />
            <div>GEN</div>
          </AmountForm>
          {
            touched && error ?
              <ValidationError>{errorMessage}</ValidationError>
              :
              <React.Fragment></React.Fragment>
          }

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
    const { bidGENStore, bidFormStore, tokenStore } = this.props.root as RootStore
    const { buttonText, userAddress } = this.props
    const pending = bidGENStore.isBidActionPending()

    const auctionsEnded = bidGENStore.areAuctionsOver()
    const auctionsStarted = bidGENStore.haveAuctionsStarted()
    const userBalance = helpers.fromWei(tokenStore.getBalance(deployed.GenToken, userAddress))
    const bidAmount = bidFormStore.bidAmount

    this.renderData = {
      userAddress,
      bidAmount,
      buttonText,
      auctionsEnded,
      auctionsStarted,
      userBalance
    }
    return (
      <PanelWrapper>
        {
          pending ?
            this.Pending() :
            this.BidForm()
        }
      </PanelWrapper>
    )
  }
}

export default BidPanel
