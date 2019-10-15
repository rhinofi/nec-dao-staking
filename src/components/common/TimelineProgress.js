import React from 'react'
import styled from 'styled-components'
import ProgressCircle from './ProgressCircle'

const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: left;
`

const Title = styled.div`
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  text-align: left;
  margin: 0px 0px 0px 20px;
  letter-spacing: 1px;
`

const Subtitle = styled(Title)`
  color: var(--inactive-header-text);
`

const TimelineProgress = ({
 value, icon, title, subtitle, width, height
}) => (
  <TimelineWrapper>
    <ProgressCircle value={value} width={width} height={height} icon={icon} />
    <TextWrapper>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </TextWrapper>
  </TimelineWrapper>
)

export default TimelineProgress
