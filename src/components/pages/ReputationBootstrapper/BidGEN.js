import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import GenAuctionTable from 'components/tables/GenAuctionTable'
import TimelineProgress from 'components/common/TimelineProgress'
import EnableTokenPanel from 'components/common/panels/EnableTokenPanel'
import BidPanel from 'components/common/panels/BidPanel'
import LogoAndText from 'components/common/LogoAndText'
// TODO: change to GEN
import icon from 'assets/svgs/ethfinex-logo.svg'
import * as helpers from 'utils/helpers'
import * as deployed from 'deployed.json'

const BidGENWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-height: 500px;Screenshot from 2019-10-08 23-01-15
`

const DetailsWrapper = styled.div`
  width: 80%;
  border-right: 1px solid var(--border);
`

const TableHeaderWrapper = styled.div`
  height: 103px
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 24px;
  border-bottom: 1px solid var(--border);
`
const ActionsWrapper = styled.div`
  width: 425px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`
const ActionsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0px 24px;
  color: var(--white-text);
  border-bottom: 1px solid var(--border);
`

const propertyNames = {
  STATIC_PARAMS: 'staticParams',
  USER_LOCKS: 'userLocks',
  AUCTION_DATA: 'auctionData'
}

@inject('root')
@observer
class BidGEN extends React.Component {
  async componentDidMount() {
    const { bidGENStore, tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken
    const schemeAddress = deployed.Auction4Reputation

    if (!bidGENStore.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)) {
      await bidGENStore.fetchStaticParams()
    }

    await tokenStore.fetchBalanceOf(genTokenAddress, userAddress)
    await tokenStore.fetchAllowance(genTokenAddress, userAddress, schemeAddress)
    await bidGENStore.fetchAuctionData()
  }

  SidePanel = () => {
    const { bidGENStore, tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken
    const spenderAddress = deployed.Auction4Reputation

    const tokenApproved = tokenStore.getMaxApprovalFlag(genTokenAddress, userAddress, spenderAddress)
    console.log('tokenApproved', tokenApproved)

    const approvePending = tokenStore.isApprovePending(genTokenAddress, userAddress, spenderAddress)
    const bidPending = bidGENStore.isBidActionPending()

    return (
      <React.Fragment>
        {tokenApproved === false ?
          <EnableTokenPanel
            instruction="Enable GEN to bid on Auctions"
            subinstructions="-"
            buttonText="Enable GEN"
            tokenAddress={genTokenAddress}
            spenderAddress={spenderAddress}
            pending={approvePending}
          /> :
          <div>
            <BidPanel
              instruction="Enable NEC for locking"
              subinstruction="-"
              buttonText="Bid GEN"
              tokenAddress={genTokenAddress}
              spenderAddress={spenderAddress}
              pending={bidPending}
            />
          </div>
        }
      </React.Fragment >
    )
  }

  /*
    If we're before the last auction:
    'Next auction starts in + time'

    If we're in the last auction:
    'Last auction ends in + time'

    If we're after the last auction conclusion:
    'Auctions have ended'
  */
  getAuctionPercentageAndTimer(currentAuction, maxAuction, now, nextStartTime, timeTillNextAuction, auctionLength) {
    let auctionPercentage = 0
    let auctionTimer = '...'

    let prefix = 'Next auction starts in'
    let ended = false

    if (currentAuction === maxAuction) {
      if (now > nextStartTime) {
        auctionPercentage = 100
        auctionTimer = 'Auctions have ended'
        ended = true
      } else {
        prefix = 'Last auction ends in'
      }
    }

    if (!ended) {
      auctionPercentage = (timeTillNextAuction / auctionLength) * 100

      const seconds = timeTillNextAuction / 1000
      let hours = (seconds / 60) / 60
      const days = Math.fround(hours / 24)
      hours -= days * 24
      hours = Math.fround(hours)
      auctionTimer = `${prefix}, ${seconds} seconds`
    }

    return {
      auctionPercentage,
      auctionTimer
    }
  }

  render() {
    const { bidGENStore, tokenStore, providerStore, timeStore } = this.props.root

    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken
    const schemeAddress = deployed.Auction4Reputation

    // Loading Status
    const staticParamsLoaded = bidGENStore.isPropertyInitialLoadComplete(propertyNames.STATIC_PARAMS)
    const auctionDataLoaded = bidGENStore.isPropertyInitialLoadComplete(propertyNames.AUCTION_DATA)
    const hasBalance = tokenStore.hasBalance(genTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(genTokenAddress, userAddress, schemeAddress)

    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return (<div>Loading.....</div>)
    }

    const auctionData = bidGENStore.auctionData
    const genBalance = tokenStore.getBalance(genTokenAddress, userAddress)
    const genBalanceDisplay = helpers.roundValue(helpers.fromWei(genBalance))
    const currentAuction = bidGENStore.getActiveAuction()
    const maxAuction = bidGENStore.staticParams.numAuctions
    const now = timeStore.currentTime
    const nextAuctionStartTime = bidGENStore.getNextAuctionStartTime()
    const timeUntilNextAuction = bidGENStore.getTimeUntilNextAuction(now)
    const auctionLength = bidGENStore.staticParams.auctionLength

    const auctionDisplayInfo = this.getAuctionPercentageAndTimer(
      currentAuction,
      maxAuction,
      now,
      nextAuctionStartTime,
      timeUntilNextAuction,
      auctionLength
    )

    const { auctionPercentage, auctionTimer } = auctionDisplayInfo

    return (
      <BidGENWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={auctionPercentage}
              title={`Current Auction: ${currentAuction} of ${maxAuction}`}
              subtitle={auctionTimer}
              width="28px"
              height="28px"
            />
          </TableHeaderWrapper>
          <GenAuctionTable
            highlightTopRow
            data={auctionData}
            dataLoaded={auctionDataLoaded}
          />
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={icon} text="GEN" />
            <div>{genBalanceDisplay}</div>
          </ActionsHeader>
          {this.SidePanel()}
        </ActionsWrapper>
      </BidGENWrapper >
    )
  }
}

export default BidGEN
