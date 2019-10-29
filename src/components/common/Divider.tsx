import React from 'react'
import styled from 'styled-components'

const StyledDivider = styled.hr`
width: ${props => props.width};
height: ${props => props.height};
margin: ${props => props.margin};
background-color: var(--inactive-border);
border: 0 none;
`

const Divider = (width, margin, height?) => {
  return <StyledDivider width={width} margin={margin} height={height || '2px'} />
}

export default Divider
