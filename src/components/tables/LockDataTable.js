import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle';

const NO_DATA_MESSAGE = 'All lock data not available'

@inject('root')
@observer
class LockDataTable extends React.Component {
    generateTableRows(data) {
        const tableData = []

        Object.keys(data).forEach(function (key, index) {

            const releasable = data[key].releasable

            /* Data
            userAddress
            lockId
            actionAvailable 
            (whatever else is needed will be set in popup)
            */

            const row = {
                extendActionData: data[key].lockId,
                releaseActionData: data[key].lockId,
                releasable,
                startPeriod: data[key].lockingPeriod,
                duration: `${data[key].duration} Months`,
                amount: `${helpers.fromWei(data[key].amount)} NEC`
            }

            tableData.push(row)
        })

        tableData.reverse()
        return tableData
    }

    renderNoDataTable() {
        return (
            <TableWrapper>
                <InactiveRowWrapper>
                    <Row>
                        <LoadingCircle instruction="Loading..." />
                    </Row>
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const lockDataLoaded = lockNECStore.isOverviewLoadComplete(userAddress)

        let rows
        if (lockDataLoaded) {
            const userLocks = lockNECStore.getUserTokenLocks(userAddress)
            rows = this.generateTableRows(userLocks.data)
        }

        const columns = [
            { name: 'Period #', key: 'batchId', width: '15%', align: 'left' },
            { name: 'You Locked', key: 'userScore', width: '25%', align: 'left' },
            { name: 'Total Locked', key: 'totalScore', width: '25%', align: 'left' },
            { name: 'You Recieved', key: 'userRepRecieved', width: '25%', align: 'left' },
            // { name: 'Extend', key: 'extendActionData', width: '15%', align: 'left' },
        ]

        return (
            <React.Fragment>
                <RowWrapper>
                    <Row>
                        {columns.map((column, index) => (
                            <GreyCell key={`col-${index}`} width={column.width} align={column.align}>
                                {column.name}
                            </GreyCell>
                        ))}
                    </Row>
                </RowWrapper>

                <TableWrapper>
                    {lockDataLoaded ?
                        <div>
                            {rows.map((row, index) => {
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
                        </div>
                        :
                        this.renderNoDataTable()
                    }
                </TableWrapper>

                }
            </React.Fragment>
        )
    }
}

export default LockDataTable
