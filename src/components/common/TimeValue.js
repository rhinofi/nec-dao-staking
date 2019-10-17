import React from 'react'
import styled from 'styled-components'
import * as helpers from 'utils/helpers'

class TokenValue extends React.Component {
    render() {
        const { timestamp, format } = this.props
        const displayValue = timestamp
        return (
            <div>{displayValue}</div>
        )
    }
}

export default TokenValue
