import React from 'react'
import * as helpers from 'utils/helpers'

type Props = {
    weiValue: any
}

class TokenValue extends React.Component<Props, any>{
    render() {
        const { weiValue } = this.props
        const displayValue = helpers.roundValue(helpers.fromWei(weiValue))
        return (
            <div>{displayValue}</div>
        )
    }
}

export default TokenValue
