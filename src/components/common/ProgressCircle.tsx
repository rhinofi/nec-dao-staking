import React from 'react'
import styled from 'styled-components'
import {
  CircularProgressbarWithChildren as Circle,
  buildStyles
} from 'react-circular-progressbar'
import './ProgressCircle.scss'

const RotateWrapper = styled.div`
  animation-name: spin;
  animation-duration: 4000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  -webkit-animation-name: spin;
  -webkit-animation-duration: 4000ms;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear;
  -moz-animation-name: spin;
  -moz-animation-duration: 4000ms;
  -moz-animation-iteration-count: infinite;
  -moz-animation-timing-function: linear;
  -ms-animation-name: spin;
  -ms-animation-duration: 4000ms;
  -ms-animation-iteration-count: infinite;
  -ms-animation-timing-function: linear;
`

const NoRotateWrapper = styled(RotateWrapper)`
  animation-direction: reverse;
  -webkit-animation-direction: reverse;
  -moz-animation-direction: reverse;
  -ms-animation-direction: reverse;
`

type Props = {
  value;
  icon?;
  width;
  height;
  rotate?;
}

const ProgressCircle = (props: Props) => {
  const { value, icon, width, height, rotate } = props
  const style = buildStyles({
    // Rotation of path and trail, in number of turns (0-1)
    rotation: 0.75,

    // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
    strokeLinecap: 'butt',
    // How long animation takes to go from one percentage to another, in seconds
    pathTransitionDuration: 2.5,

    // Colors
    pathColor: '#9872fb',
    trailColor: '#E2A907',
  })

  if (rotate) {
    return (
      <RotateWrapper style={{ width, height }}>
        <Circle
          value={value}
          strokeWidth={5}
          styles={style}
        >
          {icon !== undefined ?
            <NoRotateWrapper>{icon}</NoRotateWrapper> :
            <React.Fragment />
          }
        </Circle>
      </RotateWrapper>
    )
  } else {
    return (
      <div style={{ width, height }}>
        <Circle
          value={value}
          strokeWidth={5}
          styles={style}
        >
          {icon !== undefined ?
            icon :
            <React.Fragment />
          }
        </Circle>
      </div>
    )
  }
}

export default ProgressCircle
