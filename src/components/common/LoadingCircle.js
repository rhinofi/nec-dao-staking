import React from 'react'
import styled from 'styled-components'
import ProgressCircle from 'components/common/ProgressCircle'
import { Instruction, SubInstruction, Subtitle } from 'components/common'

const CircleAndTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
`

class LoadingCircle extends React.Component {
  render() {
    const { instruction, subinstruction } = this.props

    return (
      <React.Fragment>
        <CircleAndTextContainer>
          <ProgressCircle
            value={66} width={"45px"} height={"45px"}
            rotate
          />
          <Instruction>{instruction}</Instruction>
          <Subtitle>{subinstruction}</Subtitle>
        </CircleAndTextContainer>
      </React.Fragment>
    )
  }
}

export default LoadingCircle