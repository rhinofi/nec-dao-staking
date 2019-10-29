import React from 'react'
import styled from 'styled-components'
import * as helpers from 'utils/helpers'

export enum TokenValueFormat {
    PRECISION,
    EXPONENTIAL,
    FINANCIAL
}

type Props = {
    timestamp: number,
    format: TokenValueFormat
}
class TokenValue extends React.Component<Props, any>{
    render() {
        const { timestamp, format } = this.props
        const displayValue = timestamp
        return (
            <div>{displayValue}</div>
        )
    }
}

export default TokenValue
