import React from 'react'
import styled from 'styled-components'

const Button = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 34px;
  margin: 0px 24px;
  background: var(--action-button);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
`

const ActiveButton = ({ buttonText }) => {
  return (
    <Button>{buttonText}</Button>
  )
}

export default ActiveButton
