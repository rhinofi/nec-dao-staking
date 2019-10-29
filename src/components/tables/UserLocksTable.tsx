import React from 'react'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, InactiveRowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle';
import TableButton from 'components/common/buttons/TableButton'
import DisabledText from 'components/common/DisabledText'
import Popup from "reactjs-popup";
import ExtendLockPopup from '../common/panels/ExtendLockPopup';
import 'components/common/Modal.scss'

import BigNumber from "utils/bignumber"
import { Lock, LockStaticParams } from 'types'
import { RootStore } from 'stores/Root';
type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>

interface ActionData {
    beneficiary: string,
    lockId: string,
    releasable: number,
    released: boolean
}

class TableRow {
    constructor(
        public startPeriod: number,
        public amount: string,
        public duration: string,
        public releasable: string,
        public actionData: ActionData
    ) { }
}

const columns = [
    { name: 'Period #', key: 'startPeriod', width: '20%', align: 'left' },
    { name: 'Amount', key: 'amount', width: '20%', align: 'left' },
    { name: 'Duration', key: 'duration', width: '20%', align: 'left' },
    { name: 'Releasable', key: 'releasable', width: '20%', align: 'left' },
    { name: 'Action', key: 'actionData', width: '20%', align: 'left' },
]

@inject('root')
@observer
class UserLocksTable extends React.Component<any, any> {
    generateTableRows(inputData: Locks, userAddress) {
        const tableData: TableRow[] = [] as TableRow[]

        inputData.forEach((lock, key, map) => {
            const durationDisplay = `${lock.periodDuration} ${helpers.getMonthsSuffix(lock.periodDuration)}`
            const displayAmount = `${helpers.tokenDisplay(lock.amount)} NEC`

            // let releasableDisplay
            const releasableDisplay = helpers.timestampToDate(lock.releasable)

            const row: TableRow = {
                startPeriod: lock.lockingPeriod,
                amount: displayAmount,
                duration: durationDisplay,
                releasable: releasableDisplay,
                actionData: {
                    beneficiary: userAddress,
                    lockId: lock.id,
                    releasable: lock.releasable,
                    released: lock.released
                },
            }

            tableData.push(row)
        })

        tableData.reverse()
        return tableData
    }

    release(beneficiary, lockId) {
        const { lockNECStore } = this.props.root as RootStore as RootStore
        lockNECStore.release(beneficiary, lockId)
    }

    extend(lockId, periodsToExtend, batchId) {
        const { lockNECStore } = this.props.root as RootStore as RootStore
        lockNECStore.extendLock(lockId, periodsToExtend, batchId)
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

    generateCell(key, value) {
        const { timeStore, lockNECStore, extendLockFormStore, providerStore } = this.props.root as RootStore
        const now = timeStore.currentTime

        const userAddress = providerStore.getDefaultAccount()

        if (key === 'actionData') {
            const { released, releasable, releasableDisplay, beneficiary, lockId } = value

            const isReleasable = (now > releasable)
            const isReleaseActionPending = lockNECStore.isReleaseActionPending(lockId)

            const isLockingOver = lockNECStore.isLockingEnded()
            const remainingPeriods = lockNECStore.getPeriodsRemaining()
            // If it's not expired (aka releasable), and there are >0 periods left to extend to, we can extend
            const isExtendable = true
            const isExtendActionPending = false

            const periodsToExtend = extendLockFormStore.duration
            const batchId = lockNECStore.getActiveLockingPeriod()

            if (!isReleasable && isExtendable) {
                return <TableButton onClick={() => { this.extend(lockId, periodsToExtend, batchId) }}>Release</TableButton>
            }

            if (released) {
                return <DisabledText>Released</DisabledText>
            }

            if (!isReleaseActionPending) {
                return <TableButton onClick={() => { this.release(beneficiary, lockId) }}>Release</TableButton>
            }

            if (isReleaseActionPending) {
                return <TableButton>Pending...</TableButton>
            }

            return <DisabledText>Error</DisabledText>
        }

        return value
    }

    render() {
        const { highlightTopRow } = this.props
        const { lockNECStore, providerStore } = this.props.root as RootStore as RootStore

        const userAddress = providerStore.getDefaultAccount()
        const userLocksLoaded = lockNECStore.isUserLockInitialLoadComplete(userAddress)


        let rows
        let hasLocks = false

        if (userLocksLoaded) {
            const userLocks = lockNECStore.getUserTokenLocks(userAddress)

            userLocks.size > 0 ? hasLocks = true : hasLocks = false
            if (hasLocks) {
                rows = this.generateTableRows(userLocks, userAddress)
            }
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
                {userLocksLoaded && hasLocks ?
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
