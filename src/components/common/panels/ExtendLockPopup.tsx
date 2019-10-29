import React from 'react'
import { inject, observer } from "mobx-react";
import { ActiveLockingPeriodCell, LockingPeriodCell, LockingPeriodSelectorWrapper, LockingPeriodSelector, LockingPeriodStartCell, LockingPeriodEndCell } from 'components/common/LockingPeriodForm'
import { RootStore } from 'stores/Root';

@inject('root')
@observer
class ExtendLockPopup extends React.Component<any, any>{
    constructor(props) {
        super(props)

        this.state = {
            rangeStart: props.rangeStart
        }
    }

    setRangeStart(value) {
        this.setState({ rangeStart: value })
    }

    changeLockDuration(value) {
        const { extendLockFormStore } = this.props.root as RootStore
        extendLockFormStore.duration = value
    }

    render() {
        const { lockNECStore, extendLockFormStore } = this.props.root as RootStore
        const { rangeStart } = this.state

        const periodsRemaining = lockNECStore.getPeriodsRemaining()
        const lockDuration = extendLockFormStore.duration

        let maxLockDuration = lockNECStore.staticParams.maxLockingBatches
        let numCells = 4

        if (periodsRemaining < 4) {
            numCells = periodsRemaining
        }

        if (periodsRemaining < maxLockDuration) {
            maxLockDuration = periodsRemaining
        }

        const cells: any[] = []
        for (let i = rangeStart; i <= rangeStart + numCells; i += 1) {
            if (i === lockDuration) {
                cells.push(<ActiveLockingPeriodCell key={`cell-${i}`}>{i}</ActiveLockingPeriodCell>)
            } else {
                cells.push(
                    <LockingPeriodCell key={`cell-${i}`} onClick={() => { this.changeLockDuration(i) }}>
                        {i}
                    </LockingPeriodCell>
                )
            }
        }

        return (
            <LockingPeriodSelectorWrapper>
                <div>Extension (Months)</div>
                <LockingPeriodSelector>
                    <LockingPeriodStartCell onClick={() => {
                        this.setRangeStart(rangeStart > 1 ? rangeStart - 1 : 1)
                    }}
                    >
                        {'<'}
                    </LockingPeriodStartCell>
                    {cells}
                    <LockingPeriodEndCell
                        onClick={() => { this.setRangeStart(rangeStart + numCells < maxLockDuration ? rangeStart + 1 : rangeStart) }}
                    >
                        {'>'}
                    </LockingPeriodEndCell>
                </LockingPeriodSelector>
            </LockingPeriodSelectorWrapper>
        )
    }
}

export default ExtendLockPopup