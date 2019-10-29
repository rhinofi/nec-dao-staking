import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import { RootStore } from 'stores/Root';
import { AuctionStatus } from 'types';

const columns = [
    { name: 'Auction #', key: 'id', width: '15%', align: 'left' },
    { name: 'You Have Bid', key: 'userBid', width: '25%', align: 'right' },
    { name: 'Total Bid', key: 'totalBid', width: '30%', align: 'right' },
    { name: 'You Recieved', key: 'status', width: '25%', align: 'right' }
]

@inject('root')
@observer
class GenAuctionTable extends React.Component<any, any>{
    generateTableRows(userAddress) {
        const { bidGENStore } = this.props.root as RootStore

        let rows: any[] = []

        const auctionCount = bidGENStore.getTrackedAuctionCount()
        for (let i = 0; i < auctionCount; i++) {
            const userBid = bidGENStore.getUserBid(userAddress, i)
            const totalBid = bidGENStore.getTotalBid(i)
            const userRep = bidGENStore.getUserRep(userAddress, i)
            const status = bidGENStore.getAuctionStatus(i)

            // We need to handle very SMALL VALUES too: basically, we should NEVER use exponential for this stringify
            // We'll keep it in RAW format, and then do formatters later like with round Value.
            // We can also from WEI ourselves by mul/div 10^18
            const userBidDisplay = `${helpers.tokenDisplay(userBid)} GEN`
            const totalBidDisplay = `${helpers.tokenDisplay(totalBid)} GEN`

            let statusDisplay = status.toString()
            if (status === AuctionStatus.COMPLETE) {
                statusDisplay = `${helpers.tokenDisplay(userRep)} REP`
            }

            rows.push({
                id: i,
                userBid: userBidDisplay,
                totalBid: totalBidDisplay,
                status: statusDisplay
            })
        }
        return rows.reverse()
    }

    renderNoDataTable() {
        return (
            <TableWrapper>
                <InactiveRowWrapper>
                    <Row>
                    </Row>
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    render() {
        const { highlightTopRow } = this.props
        const { bidGENStore, providerStore } = this.props.root as RootStore

        const userAddress = providerStore.getDefaultAccount()
        const auctionDataLoaded = bidGENStore.isAuctionDataLoaded()
        const auctionsStarted = bidGENStore.haveAuctionsStarted()

        let data
        if (auctionDataLoaded && auctionsStarted) {
            data = this.generateTableRows(userAddress)
        }

        return (
            <React.Fragment>
                <RowWrapper>
                    <Row>
                        {columns.map((column, index) => {
                            return (
                                <GreyCell key={`column-${index}`} width={column.width} align={column.align}>
                                    {column.name}
                                </GreyCell>
                            )
                        })}
                    </Row>
                </RowWrapper>
                {auctionDataLoaded && auctionsStarted ?
                    <TableWrapper>
                        {data.map((row, index) => {
                            const highlight = !highlightTopRow || index === 0
                            const Cell = highlight ? CellWrapper : GreyCell
                            const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
                            return (
                                <Wrapper key={`wrapper-${index}`}>
                                    <Row key={`row-${index}`}>
                                        {columns.map((column, index) => {
                                            return (
                                                <Cell key={`cell-${index}`} width={column.width} align={column.align}>
                                                    {row[column.key]}
                                                </Cell>
                                            )
                                        })}
                                    </Row>
                                </Wrapper>
                            )
                        })}
                    </TableWrapper>
                    :
                    this.renderNoDataTable()
                }
            </React.Fragment>
        )
    }
}

export default GenAuctionTable
