import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle';
import TableButton from 'components/common/buttons/TableButton'
import DisabledText from 'components/common/DisabledText'

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
            const released = inputData[key].released
            const releasableDisplay = helpers.timestampToDate(releasable)

            const row = {
                startPeriod,
                amount: displayAmount,
                duration: durationDisplay,
                extendData: {
                    lockId: lockId
                },
                releaseData: {
                    beneficiary: userAddress,
                    lockId: lockId,
                    releasable,
                    released,
                    releasableDisplay
                },
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
                        <LoadingCircle instruction="Loading..." />
                    </Row>
                </InactiveRowWrapper>
            </TableWrapper>
        )
    }

    generateCell(key, value) {
        const { timeStore, lockNECStore } = this.props.root
        const now = timeStore.currentTime

        if (key === 'releaseData') {
            const { released, releasable, releasableDisplay, beneficiary, lockId } = value

            const isReleasable = (now > releasable)
            const isReleaseActionPending = lockNECStore.isReleaseActionPending(lockId)


            if (!isReleasable) {
                return <div>{releasableDisplay}</div>
            }

            if (released) {
                return <DisabledText>Released</DisabledText>
            }

            if (isReleasable && !released && !isReleaseActionPending) {
                return <TableButton onClick={() => { this.release(beneficiary, lockId) }}>Release</TableButton>
            }

            if (isReleasable && !released && isReleaseActionPending) {
                return <TableButton>Pending...</TableButton>
            }

            return <DisabledText>Error</DisabledText>
        }

        if (key === 'extendData') {
            const { lockId } = value
            const canExtend = true
            if (canExtend) {
                return <TableButton onClick={() => { console.log('make the modal appear and pass in this lockId') }}>Extend</TableButton>
            } else {
                return <DisabledText>Extend</DisabledText>
            }
        }

        return value
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root

        const userAddress = providerStore.getDefaultAccount()
        const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)
        const userLocks = lockNECStore.getUserTokenLocks(userAddress)

        let rows

        if (userLocksLoaded) {
            rows = this.generateTableRows(userLocks.data, userAddress)
        }

        const columns = [
            { name: 'Period #', key: 'startPeriod', width: '20%', align: 'left' },
            { name: 'Amount', key: 'amount', width: '20%', align: 'left' },
            { name: 'Duration', key: 'duration', width: '20%', align: 'left' },
            { name: 'Extend', key: 'extendData', width: '20%', align: 'left' },
            { name: 'Release', key: 'releaseData', width: '20%', align: 'left' },
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
                {userLocksLoaded ?
                    <TableWrapper>
                        {rows.map((row, index) => {
                            const highlight = !highlightTopRow || index === 0
                            const Cell = highlight ? CellWrapper : GreyCell
                            const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
                            return (
                                <Wrapper key={`wrapper-${index}`} >
                                    <Row key={`row-${index}`}>
                                        {columns.map((column, index) => (
                                            <Cell key={`cell-${index}`} width={column.width} align={column.align}>
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
