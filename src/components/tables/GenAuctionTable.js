import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'

@inject('root')
@observer
class GenAuctionTable extends React.Component {
    generateTableRows(userAddress) {
        const { bidGENStore } = this.props.root

        let rows = []

        const auctionCount = bidGENStore.getTrackedAuctionCount()
        for (let i = 0; i < auctionCount; i++) {
            const userBid = bidGENStore.getUserBid(userAddress, i)
            const totalBid = bidGENStore.getTotalBid(i)
            const status = bidGENStore.getAuctionStatus(i)

            const userBidDisplay = `${helpers.roundValue(helpers.fromWei(userBid.toString()))} GEN`
            const totalBidDisplay = `${helpers.roundValue(helpers.fromWei(totalBid.toString()))} GEN`

            rows.push({
                id: i,
                userBid: userBidDisplay,
                totalBid: totalBidDisplay,
                status: status
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
        const { bidGENStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const auctionDataLoaded = bidGENStore.isPropertyInitialLoadComplete('auctionData')
        const auctionsStarted = bidGENStore.haveAuctionsStarted()

        const columns = [
            { name: 'Auction #', key: 'id', width: '15%', align: 'left' },
            { name: 'You Have Bid', key: 'userBid', width: '25%', align: 'right' },
            { name: 'Total Bid', key: 'totalBid', width: '30%', align: 'right' },
            { name: 'Status', key: 'status', width: '25%', align: 'right' }
        ]

        let data
        if (auctionDataLoaded && auctionsStarted) {
            data = this.generateTableRows(userAddress)
        }

        console.log(data)

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
