import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import Table from 'components/common/Table'
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

@inject('root')
@observer
class BidGEN extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      auctionPercentage: 0,
      auctionTimer: '...'
    }
  }

  SidePanel = () => {
    const { tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const tokenApproved = tokenStore.hasMaxApproval[userAddress]
    const genTokenAddress = deployed.GenToken
    const spenderAddress = deployed.Auction4Reputation

    return (
      <React.Fragment>
        {tokenApproved === false ?
          <EnableTokenPanel
            instruction="Enable GEN to bid on Auctions"
            subinstructions="-"
            buttonText="Enable GEN"
            user={userAddress}
            token={genTokenAddress}
            spender={spenderAddress}
          /> :
          <div>
            <BidPanel
              instruction="Enable NEC for locking"
              subinstruction="-"
              buttonText="Bid GEN"
              user={userAddress}
              token={genTokenAddress}
              spender={spenderAddress}
            />
          </div>
        }
      </React.Fragment >
    )
  }

  render() {
    const { bidGENStore, tokenStore, providerStore } = this.props.root
    const { auctionPercentage, auctionTimer } = this.state

    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken

    const auctionData = bidGENStore.auctionData
    const genBalance = tokenStore.getBalance(genTokenAddress, userAddress)
    const genBalanceDisplay = helpers.fromWei(genBalance)
    const currentAuction = bidGENStore.getActiveAuction()
    const maxAuction = bidGENStore.numAuctions

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
          <Table
            highlightTopRow
            columns={[
              { name: 'Auction #', key: 'id', width: '15%', align: 'left' },
              { name: 'You Have Bid', key: 'userBid', width: '25%', align: 'right' },
              { name: 'Total Bid', key: 'totalBid', width: '30%', align: 'right' },
              { name: 'Status', key: 'status', width: '25%', align: 'right' }
            ]}
            data={auctionData}
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
