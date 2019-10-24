import React from 'react'
import styled from 'styled-components'
import ProgressCircle from 'components/common/ProgressCircle'
import { PanelWrapper, Instruction, SubInstruction, CircleAndTextContainer, Icon, Button, DisableButton } from 'components/common'
import checkboxIcon from 'assets/svgs/checkbox.svg'
import { observer, inject } from 'mobx-react'

@inject('root')
@observer
class EnableTokenPanel extends React.Component {
  Enable = () => {
    const { tokenStore } = this.props.root
    const { instruction, subinstruction, buttonText, spenderAddress, tokenAddress } = this.props

    return (
      <React.Fragment>
        <CircleAndTextContainer>
          <ProgressCircle
            value={0} width={"45px"} height={"45px"}
            icon={(<Icon src={checkboxIcon} />)}
          />
          <Instruction>{instruction}</Instruction>
          <SubInstruction>{subinstruction}</SubInstruction>
        </CircleAndTextContainer>
        <Button onClick={() => { tokenStore.approveMax(tokenAddress, spenderAddress) }}>
          {buttonText}
        </Button>
      </React.Fragment >
    )
  }

  Pending = () => {
    const { instruction, subinstruction, buttonText } = this.props

    return (
      <React.Fragment>
        <CircleAndTextContainer>
          <ProgressCircle
            value={66} width={"45px"} height={"45px"}
            rotate
          />
          <Instruction>{instruction}</Instruction>
          <SubInstruction>{subinstruction}</SubInstruction>
        </CircleAndTextContainer>
        <DisableButton>{buttonText}</DisableButton>
      </React.Fragment >
    )
  }

  render() {
    const { enabled, pending } = this.props

    return (
      <PanelWrapper>
        {pending ?
          this.Pending() :
          enabled ?
            <div></div> :
            this.Enable()
        }
      </PanelWrapper >
    )
  }
}

export default EnableTokenPanel
