import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'

const NO_DATA_MESSAGE = 'User has no token locks'

@inject('root')
@observer
class UserLocksTable extends React.Component {
    generateTableRows(inputData, userAddress) {
        const tableData = []

        Object.keys(inputData).forEach(function (key, index) {
            const lockId = inputData[key].lockId

            const duration = inputData[key].duration
            const durationDisplay = `${duration} ${helpers.getMonthsSuffix(duration)}`

            const weiAmount = inputData[key].amount
            const displayAmount = `${helpers.roundValue(helpers.fromWei(weiAmount))} NEC`

            const startPeriod = inputData[key].lockingPeriod

            const releasable = inputData[key].releasable
            const releasableDisplay = helpers.timestampToDate(releasable)

            const row = {
                startPeriod,
                amount: displayAmount,
                duration: durationDisplay,
                releasable: releasableDisplay,
                releaseActionData: { beneficiary: userAddress, lockId: lockId },
            }

            tableData.push(row)
        })

        tableData.reverse()
        return tableData
    }

    release(beneficiary, lockId) {
        const { lockNECStore } = this.props.root
        lockNECStore.release(beneficiary, lockId)
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

    generateCell(key, value) {
        if (key === 'releaseActionData') {
            const { beneficiary, lockId } = value
            return <div onClick={() => { this.release(beneficiary, lockId) }}>Release</div>
        }

        return value
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)
        const userLocks = lockNECStore.getUserTokenLocks(userAddress)
        const rows = this.generateTableRows(userLocks.data, userAddress)

        const columns = [
            { name: 'Period #', key: 'startPeriod', width: '20%', align: 'left' },
            { name: 'Amount', key: 'amount', width: '20%', align: 'left' },
            { name: 'Duration', key: 'duration', width: '20%', align: 'left' },
            { name: 'Releasable', key: 'releasable', width: '20%', align: 'left' },
            // { name: 'Extend', key: 'extendActionData', width: '15%', align: 'left' },
            { name: 'Action', key: 'releaseActionData', width: '20%', align: 'left' }
        ]

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
                {userLocksLoaded ?
                    <TableWrapper>
                        {rows.map((row, index) => {
                            const highlight = !highlightTopRow || index === 0
                            const Cell = highlight ? CellWrapper : GreyCell
                            const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
                            return (
                                <Wrapper>
                                    <Row>
                                        {columns.map(column => (
                                            <Cell width={column.width} align={column.align}>
                                                {this.generateCell(column.key, row[column.key])}
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

export default UserLocksTable
