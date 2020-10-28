import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import { RootStore } from 'stores/Root';
import { Batch } from 'types';
import LoadingCircle from 'components/common/LoadingCircle';

const columns = [
    { name: 'Period', key: 'batchIdDisplay', width: '10%', align: 'left' },
    { name: 'You Locked', key: 'userLocked', width: '25%', align: 'right' },
    { name: 'Total Reputation', key: 'totalRep', width: '30%', align: 'right' },
    { name: 'You Will Receive', key: 'userRep', width: '30%', align: 'right' },
]

@inject('root')
@observer
class BatchesTable extends React.Component<any, any>{
    generateTableRows(data, maxIndexToDisplay) {
        const tableData: any[] = []


        data.forEach((batch: Batch, key, map) => {
            if (key <= maxIndexToDisplay) {
                const row = {
                    batchId: batch.id,
                    batchIdDisplay: batch.id + 1,
                    userLocked: helpers.tokenDisplay(batch.userLocked) + ' NEC',
                    totalRep: helpers.tokenDisplay(batch.totalRep) + ' REP',
                    userRep: key === maxIndexToDisplay && !batch.isComplete ? 'In Progress' : helpers.tokenDisplay(batch.userRep) + ' REP',
                    // userRep: helpers.fromRep(data[key].userRep.toString())
                    isComplete: batch.isComplete
                }

                tableData.push(row)
            }
        })

        tableData.reverse()
        return tableData
    }

    renderNoDataTable(isLoading: boolean) {
        return (
            <TableWrapper>
                <InactiveRowWrapper>
                    {isLoading ?
                        <LoadingCircle instruction="Loading..." />
                        :
                        <React.Fragment></React.Fragment>
                    }
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root as RootStore

        const userAddress = providerStore.getDefaultAccount()
        const lockDataLoaded = lockNECStore.areBatchesLoaded(userAddress)
        const isLockingStarted = lockNECStore.isLockingStarted()
        const maxIndexToDisplay = Math.min(lockNECStore.getFinalBatchIndex(), lockNECStore.getActiveLockingBatch())

        let rows
        if (lockDataLoaded) {
            const lockData = lockNECStore.getBatches(userAddress)
            rows = this.generateTableRows(lockData, maxIndexToDisplay)
        }

        return (
            <React.Fragment>
                <RowWrapper>
                    <Row>
                        {columns.map((column, index) => (
                            //@ts-ignore
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
                                    <Wrapper key={`wrapper-${index}`}>
                                        <Row key={`row-${index}`}>
                                            {columns.map((column, index) => (
                                                //@ts-ignore
                                                <Cell key={`cell-${index}`} style={{ width: column.width, align: column.align }}>
                                                    {row[column.key]}
                                                </Cell>
                                            ))}
                                        </Row>
                                    </Wrapper>
                                )
                            })}
                        </div>
                        :
                        this.renderNoDataTable(isLockingStarted)
                    }
                </TableWrapper>
            </React.Fragment>
        )
    }
}

export default BatchesTable
