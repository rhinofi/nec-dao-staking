import React from 'react'
import { PanelWrapper, LockFormWrapper, LockAmountWrapper, LockAmountForm, ReleaseableDateWrapper, ReleaseableDate } from './LockPanel'
import Tooltip from '../Tooltip'

interface Props {
    text: string
    tooltip?: string
}

class PanelExplainer extends React.Component<Props, any>{
    render() {
        const { text, tooltip } = this.props
        return (
            <React.Fragment>
                <LockFormWrapper>
                    <LockAmountWrapper>
                        {text}
                        {tooltip ?
                            <Tooltip title='' content={tooltip} position="left center"></Tooltip>
                            :
                            <React.Fragment></React.Fragment>
                        }
                    </LockAmountWrapper>
                    <LockAmountForm>
                    </LockAmountForm>
                </LockFormWrapper>
            </React.Fragment>
        )
    }

}

export default PanelExplainer
