import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'

const columns = [
    { name: 'Period #', key: 'batchId', width: '15%', align: 'left' },
    { name: 'You Locked', key: 'userLocked', width: '25%', align: 'right' },
    { name: 'Total Locked', key: 'totalLocked', width: '25%', align: 'right' },
    { name: 'Rep Received', key: 'userRep', width: '30%', align: 'right' },
]

@inject('root')
@observer
class BatchesTable extends React.Component {
    generateTableRows(data) {
        const tableData = []

        Object.keys(data).forEach(key => {

            const row = {
                batchId: data[key].id,
                userLocked: helpers.toAmount(data[key].userLocked.toString()),
                totalLocked: helpers.toAmount(data[key].totalLocked.toString()),
                userRep: data[key].isComplete ? '#todo' : 'In Progress'
                // userRep: helpers.fromRep(data[key].userRep.toString())
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
                        {/* <LoadingCircle instruction="Loading..." /> */}
                    </Row>
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const lockDataLoaded = lockNECStore.areBatchesLoaded(userAddress)

        let rows
        if (lockDataLoaded) {
            const lockData = lockNECStore.getBatches(userAddress)
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

export default BatchesTable
