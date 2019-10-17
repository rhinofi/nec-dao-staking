import React from 'react'
import styled from 'styled-components'
import * as helpers from 'utils/helpers'

class TokenValue extends React.Component {
    render() {
        const { weiValue } = this.props
        const displayValue = helpers.roundValue(helpers.fromWei(weiValue))
        return (
            <div>{displayValue}</div>
        )
    }
}

export default TokenValue
