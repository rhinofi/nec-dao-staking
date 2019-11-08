import React from 'react'
import styled from 'styled-components'
import { PanelText } from 'components/common'
import { LockFormWrapper } from './LockPanel'
import { AmountLabelWrapper } from 'components/common/Panel'
import Tooltip from '../common/Tooltip'

interface Props {
    text: string
    tooltip?: string
}

const TextWrapper = styled.div`
    width: 80%;
`

class PanelExplainer extends React.Component<Props, any>{
    render() {
        const { text, tooltip } = this.props
        return (
            <React.Fragment>
                <LockFormWrapper>
                    <AmountLabelWrapper>
                        <PanelText>
                            <TextWrapper>{text}</TextWrapper>
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
