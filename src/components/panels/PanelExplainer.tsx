import React from 'react'
import { PanelText } from 'components/common'
import { PanelWrapper, LockFormWrapper, LockAmountWrapper, LockAmountForm, ReleaseableDateWrapper, ReleaseableDate } from './LockPanel'
import Tooltip from '../common/Tooltip'

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
                        <PanelText>
                            {text}
                            {tooltip ?
                                <Tooltip title='' content={tooltip} position="left center"></Tooltip>
                                :
                                <React.Fragment></React.Fragment>
                            }
                        </PanelText>
                    </LockAmountWrapper>
                </LockFormWrapper>
            </React.Fragment>
        )
    }

}

export default PanelExplainer
