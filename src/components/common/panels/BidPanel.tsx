import React from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { inject, observer } from "mobx-react";
import * as helpers from 'utils/helpers'
import { MaxButton } from './LockPanel'
import { PanelText } from 'components/common'
import InactiveButton from 'components/common/buttons/InactiveButton'
import ActiveButton from 'components/common/buttons/ActiveButton'
import LoadingCircle from '../LoadingCircle';
import { deployed } from 'config.json'
import { RootStore } from 'stores/Root';
import BigNumber from 'utils/bignumber';

const PanelWrapper = styled.div`
`

const BidWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 24px 42px;
  font-weight: 500;
  color: var(--inactive-text);
`

const ValidationError = styled.div`
  text-align: right;
  color: var(--invalid-red);
  font-family: Montserrat;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  margin-top: 8px;
  margin-bottom: -23px;
`

const BidAmountWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const BidForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 18px;
  padding: 0px 20px 6px 20px;
  input {
    font-size: 15px;
    line-height: 18px;
    color: var(--white-text);
    background: var(--background);
    border: none;
  }
`

interface FormStatus {
  isValid: boolean;
  errorMessage: string;
}

@inject('root')
@observer
class BidPanel extends React.Component<any, any>{
  constructor(props) {
    super(props)
    this.state = {
      bidForm: {
        touched: false,
        error: false,
        errorMessage: ""
      }
    }
  }
  setBidAmount(value) {
    const { bidFormStore } = this.props.root as RootStore
    const { bidForm } = this.state
    bidFormStore.setBidAmount(value)
    this.setState({
      bidForm: {
        ...bidForm,
        touched: true
      }
    })

  }

  isBidAmountValid(value, maxValue, actionText: string): FormStatus {
    /*
    * must be a number
    * positive numbers only
    * <=18 decimals
    * must be filled in
    * must be <= to user balance
    * must be greater than a minimum contribution value (1 token)
    */

    if (helpers.isEmpty(value)) {
      return {
        isValid: false,
        errorMessage: "Please input a token value"
      }
    }

    if (!helpers.isNumeric(value)) {
      return {
        isValid: false,
        errorMessage: "Please input a valid number"
      }
    }

    if (helpers.isZero(value)) {
      return {
        isValid: false,
        errorMessage: `Cannot ${actionText} zero tokens`
      }
    }

    if (helpers.isPositiveNumber(value)) {
      return {
        isValid: false,
        errorMessage: "Please input a positive number"
      }
    }

    if (helpers.getDecimalPlaces(value) > 18) {
      return {
        isValid: false,
        errorMessage: "Input exceeds 18 decimal places"
      }
    }

    if (helpers.isGreaterThan(value, maxValue)) {
      return {
        isValid: false,
        errorMessage: "Insufficent Balance"
      }
    }

    if (helpers.isLessThan(value, 1)) {
      return {
        isValid: false,
        errorMessage: `Minimum ${actionText} is one token`
      }
    }

    return {
      isValid: true,
      errorMessage: ""
    }
  }

  async bid() {
    const { bidFormStore, bidGENStore, tokenStore } = this.props.root as RootStore
    const { userAddress } = this.props
    const { bidForm } = this.state
    const userBalance = helpers.fromWei(tokenStore.getBalance(deployed.GenToken, userAddress))

    const formStatus = this.isBidAmountValid(bidFormStore.bidAmount, userBalance, 'bid')

    if (!formStatus.isValid) {
      this.setState({
        bidForm: {
          ...bidForm,
          error: true,
          errorMessage: formStatus.errorMessage
        }
      })
      return
    } else {
      this.setState({
        bidForm: {
          ...bidForm,
          error: false,
          errorMessage: ""
        }
      })
    }

    const weiValue = helpers.toWei(bidFormStore.bidAmount)
    const currentAuction = bidGENStore.getActiveAuction()

    await bidGENStore.bid(weiValue, currentAuction)
    bidFormStore.resetForm()
  }

  Pending() {
    const { bidGENStore, bidFormStore } = this.props.root as RootStore
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
    const { touched, error, errorMessage } = this.state.bidForm

    return (
      <React.Fragment>
        <BidWrapper>
          <PanelText>
            GEN is the native DAOstack token, primarily used for prediction markets and boosting proposals.
          </PanelText>
          <BidAmountWrapper>
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
          </BidAmountWrapper>
          <BidForm className={touched && error ? "invalid-border" : ""}>
            <input type="text" name="name" placeholder="0" value={bidAmount} onChange={e => this.setBidAmount(e.target.value)} />
            <div>GEN</div>
          </BidForm>
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
