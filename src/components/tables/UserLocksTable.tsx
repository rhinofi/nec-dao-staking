import React from 'react'
import styled from 'styled-components'
import { inject, observer } from "mobx-react";
import { TableWrapper, RowWrapper, Row, CellWrapper, GreyCell } from 'components/common/Table'
import 'components/common/Table.scss'
import * as helpers from 'utils/helpers'
import LoadingCircle from '../common/LoadingCircle';
import TableButton from 'components/common/buttons/TableButton'
import DisabledText from 'components/common/DisabledText'
import 'components/common/Modal.scss'

import BigNumber from "utils/bignumber"
import { Lock } from 'types'
import { RootStore } from 'stores/Root';
import { duration } from 'moment';
type Scores = Map<number, BigNumber>
type Locks = Map<string, Lock>

interface ActionData {
    beneficiary: string,
    lockId: string,
    releasable: number,
    released: boolean,
    batchDuration: number,
}
interface ReleasableData {
    releasableTimestamp: number;
    releasableDateDisplay: string;
}

const InactiveRowWrapper = styled.div`
  border-bottom: 1px solid var(--faded-border);
  cursor: pointer;
`

enum TableRowKeys {
    lockId = 'lockId',
    startBatch = 'startBatch',
    amount = 'amount',
    duration = 'duration',
    releasableData = 'releasableData',
    actionData = 'actionData'
}

class TableRow {
    constructor(
        public lockId: string,
        public startBatch: number,
        public amount: string,
        public duration: string,
        public releasableData: ReleasableData,
        public actionData: ActionData
    ) { }
}

const columns = [
    { name: 'Period', key: TableRowKeys.startBatch, width: '10%', align: 'left' },
    { name: 'Amount', key: TableRowKeys.amount, width: '30%', align: 'right' },
    { name: 'Duration', key: TableRowKeys.duration, width: '20%', align: 'right' },
    { name: 'Releasable', key: TableRowKeys.releasableData, width: '20%', align: 'right' },
    { name: 'Action', key: TableRowKeys.actionData, width: '15%', align: 'right' },
]

@inject('root')
@observer
class UserLocksTable extends React.Component<any, any> {
    constructor(props) {
        super(props)
    }

    setSelectedLock(lockId: string) {
        const { extendLockFormStore } = this.props.root as RootStore
        extendLockFormStore.setSelectedLockId(lockId)
    }

    generateTableRows(inputData: Locks, userAddress) {
        const tableData: TableRow[] = [] as TableRow[]

        inputData.forEach((lock) => {
            const durationDisplay = `${lock.batchDuration} ${helpers.getMonthsSuffix(lock.batchDuration)}`
            const displayAmount = `${helpers.tokenDisplay(lock.amount)} NEC`

            // let releasableDisplay
            const releasableDateDisplay = helpers.timestampToDate(lock.releasable)

            const row: TableRow = {
                lockId: lock.id,
                startBatch: lock.lockingBatch + 1,
                amount: displayAmount,
                duration: durationDisplay,
                releasableData: {
                    releasableTimestamp: lock.releasable,
                    releasableDateDisplay
                },
                actionData: {
                    beneficiary: userAddress,
                    lockId: lock.id,
                    releasable: lock.releasable,
                    released: lock.released,
                    batchDuration: lock.batchDuration,
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

    extend(lockId, batchesToExtend, batchId) {
        const { lockNECStore } = this.props.root as RootStore as RootStore
        lockNECStore.extendLock(lockId, batchesToExtend, batchId)
    }

    renderTableDataLoading() {
        return (
            <TableWrapper>
                <InactiveRowWrapper>
                    <LoadingCircle instruction="Loading..." />
                </InactiveRowWrapper>
            </TableWrapper>
        )
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

    generateCell(key, value) {
        const { timeStore, txTracker, lockNECStore } = this.props.root as RootStore
        const maxDuration = lockNECStore.staticParams.maxLockingBatches
        const now = timeStore.currentTime

        if (key === TableRowKeys.actionData) {
            const { released, releasable, beneficiary, lockId, batchDuration } = value
            const isReleasable = (now > releasable)
            const isReleaseActionPending = txTracker.isReleaseActionPending(lockId)

            // If it's not expired (aka releasable), and there are >0 batches left to extend to, we can extend
            const isExtendable = batchDuration < maxDuration

            if (isExtendable && !isReleasable) {
                return <TableButton>Extend</TableButton>
            }

            if (isExtendable && !isReleasable) {
                return <TableButton>Extend</TableButton>
            }

            if (released) {
                return <DisabledText>Released</DisabledText>
            }

            if (isReleasable && !isReleaseActionPending) {
                return <TableButton onClick={() => { this.release(beneficiary, lockId) }}>Release</TableButton>
            }

            if (isReleaseActionPending) {
                return <TableButton>Pending...</TableButton>
            }

            if (batchDuration >= maxDuration && !isReleasable) {
                return <DisabledText>---</DisabledText>
            }

            return <DisabledText>Error</DisabledText>
        }

        /* Display the releasable column as a date, unless we are <24 hours to releasable time: in which case show a countdown clock */
        if (key === TableRowKeys.releasableData) {
            const { releasableTimestamp, releasableDateDisplay } = value as ReleasableData
            const timeUntilReleasable = releasableTimestamp - now;

            console.log({
                releasableTimestamp,
                releasableDateDisplay,
                timeUntilReleasable,
                time: helpers.formatTimeRemaining(timeUntilReleasable)
            })

            if (timeUntilReleasable < helpers.timeConstants.inSeconds.DAY && timeUntilReleasable > 0) {
                return helpers.formatTimeRemaining(timeUntilReleasable)
            }

            return releasableDateDisplay
        }

        return value
    }

    render() {
        const { lockNECStore, providerStore, extendLockFormStore } = this.props.root as RootStore
        const selectedLock = extendLockFormStore.selectedLockId

        const userAddress = providerStore.getDefaultAccount()
        const userLocksLoaded = lockNECStore.areUserLocksLoaded(userAddress)

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
                            //@ts-ignore
                            <GreyCell key={`col-${index}`} width={column.width} align={column.align}>
                                {column.name}
                            </GreyCell>
                        ))}
                    </Row>
                </RowWrapper>
                {userLocksLoaded && hasLocks ?
                    <TableWrapper>
                        {rows.map((row, index) => {
                            const highlight = selectedLock && selectedLock === row.lockId ? true : false
                            const Cell = highlight ? CellWrapper : GreyCell
                            const Wrapper = highlight ? RowWrapper : InactiveRowWrapper
                            return (
                                <Wrapper key={`wrapper-${index}`} onClick={() => { this.setSelectedLock(row.lockId) }} >
                                    <Row key={`row-${index}`}>
                                        {columns.map((column, index) => (
                                            //@ts-ignore
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
                    this.renderNoDataTable(hasLocks)
                }
            </React.Fragment>
        )
    }
}

export default UserLocksTable
