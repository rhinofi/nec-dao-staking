import React from 'react'
import { PanelText } from 'components/common'
import { LockFormWrapper } from './LockPanel'
import { PanelWrapper, AmountLabelWrapper } from 'components/common/Panel'
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
                    <AmountLabelWrapper>
                        <PanelText>
                            {text}
                            {tooltip ?
                                <Tooltip title='' content={tooltip} position="left center"></Tooltip>
                                :
                                <React.Fragment></React.Fragment>
                            }
                        </PanelText>
                    </AmountLabelWrapper>
                </LockFormWrapper>
            </React.Fragment>
        )
    }

}

export default PanelExplainer
