import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle';

const columns = [
    { name: 'Period #', key: 'batchId', width: '15%', align: 'left' },
    { name: 'Your Score', key: 'userScore', width: '25%', align: 'left' },
    { name: 'Total Score', key: 'totalScore', width: '25%', align: 'left' },
    { name: 'Total Rep', key: 'totalRepAllocation', width: '25%', align: 'left' },
    // { name: 'Total Rep', key: 'userRepRecieved', width: '25%', align: 'left' },
    // { name: 'Extend', key: 'extendActionData', width: '15%', align: 'left' },
]

@inject('root')
@observer
class LockDataTable extends React.Component {
    generateTableRows(data) {
        const tableData = []

        for (let i = 0; i < data.length; i++) {

            const row = {
                batchId: data[i].batchId,
                totalScore: helpers.fromWei(data[i].totalScore),
                totalRepAllocation: helpers.fromWei(data[i].totalRepAllocation),
                userScore: '-'
            }

            tableData.push(row)
        }

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
        const lockDataLoaded = lockNECStore.isLockOverviewLoaded(userAddress)

        let rows
        if (lockDataLoaded) {
            const lockData = lockNECStore.getOverview(userAddress)
            rows = this.generateTableRows(lockData)
        }

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
