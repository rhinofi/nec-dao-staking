import React from 'react'
import styled from 'styled-components'
import ProgressCircle from './ProgressCircle'
import Tooltip from 'components/common/Tooltip'

const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: left;
  width: 265px;
`

const Title = styled.div`
  display: flex;
  flex-direction: row;
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
  font-size: 14px;  
  color: var(--inactive-header-text);
`

type Props = {
  value;
  icon?;
  title;
  subtitle;
  width;
  height;
  displayTooltip: boolean;
}

type State = {

}

class TimelineProgress extends React.Component<Props, State> {
  render() {
    const { value, icon, title, subtitle, width, height, displayTooltip } = this.props

    let tooltip
    if (displayTooltip) {
      tooltip = <Tooltip title={''} content="This is placeholder text describing the Title in the Selector." position="right top" />
    }

    return (
      <TimelineWrapper>
        <ProgressCircle value={value} width={width} height={height} icon={icon} />
        <TextWrapper>
          <Title>
            {title}
            {tooltip}
          </Title>
          <Subtitle>{subtitle}</Subtitle>
        </TextWrapper>
      </TimelineWrapper>
    )
  }
}

export default TimelineProgress
