import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'

@inject('root')
@observer
class GenAuctionTable extends React.Component {
    generateTableData(auctionData, userAddress) {
        if (!auctionData) {
            return {}
        }

        const data = auctionData.map((auction, index) => {
            const userBid = auction.bids[userAddress] ? auction.bids[userAddress] : '0'
            const totalBid = auction.totalBids ? auction.totalBids : '0'

            return {
                id: Number(index),
                userBid: `${helpers.roundValue(helpers.fromWei(userBid))} GEN`,
                totalBid: `${helpers.roundValue(helpers.fromWei(totalBid))} GEN`,
                status: auction.status
            }
        }).reverse()

        console.log(data)
        return data
    }

    renderNoDataTable() {
        return (
            <TableWrapper>
                <InactiveRowWrapper>
                    <Row>
                        Loading auction data...
                    </Row>
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    render() {
        const { highlightTopRow } = this.props
        const { bidGENStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const auctionDataLoaded = bidGENStore.isPropertyInitialLoadComplete('auctionData')

        const columns = [
            { name: 'Auction #', key: 'id', width: '15%', align: 'left' },
            { name: 'You Have Bid', key: 'userBid', width: '25%', align: 'right' },
            { name: 'Total Bid', key: 'totalBid', width: '30%', align: 'right' },
            { name: 'Status', key: 'status', width: '25%', align: 'right' }
        ]

        const auctionData = bidGENStore.auctionData
        const data = this.generateTableData(auctionData, userAddress)

        return (
            <React.Fragment>
                <RowWrapper>
                    <Row>
                        {columns.map(column => (
                            <GreyCell width={column.width} align={column.align}>
                                {column.name}
                            </GreyCell>
                        ))}
                    </Row>
                </RowWrapper>
                {auctionDataLoaded ?
                    <TableWrapper>
                        {data.map((row, index) => {
                            const highlight = !highlightTopRow || index === 0
                            const Cell = highlight ? CellWrapper : GreyCell
                            const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
                            return (
                                <Wrapper>
                                    <Row>
                                        {columns.map(column => (
                                            <Cell width={column.width} align={column.align}>
                                                {row[column.key]}
                                            </Cell>
                                        ))}
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
