import React from 'react'
import * as helpers from 'utils/helpers'
import BigNumber from 'utils/bignumber'

type Props = {
    weiValue: BigNumber
    tokenName?: string
}

class TokenValue extends React.Component<Props, any>{
    render() {
        const { weiValue, tokenName } = this.props
        const displayValue = helpers.tokenDisplay(weiValue)
        return (
            <React.Fragment>
                {
                    tokenName ?
                        <div>{`${displayValue} ${tokenName}`}</div>
                        :
                        <div>{displayValue}</div>
                }
            </React.Fragment>
        )
    }
}

export default TokenValue
