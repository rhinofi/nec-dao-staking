import React from 'react'
import Popup from 'reactjs-popup'
import styled from 'styled-components'

const TooltipIndicator = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 11px;
  font-size: 11px;
  text-align: center;
  color: var(--inactive-header-text);
  border: 1px solid var(--inactive-border);
`

const Tooltip = ({ title, content, position }) => {
  return (
    <Popup
      trigger={<TooltipIndicator>i</TooltipIndicator>}
      position={position}
      on="hover"
    >
      <div className="testing" style={{ border: "none" }}>
        <div>{title}</div>
        <div>{content}</div>
      </div>
    </Popup>
  )
}

export default Tooltip
