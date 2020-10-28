import React from 'react'
import styled from 'styled-components'

const LogoAndTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 24px;
`

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  height: 24px;
  width: 24px;
  background: var(--logo-background);
  border-radius: 12px;
`

const Logo = styled.img`
  width: 15px;
  height: 15px;
`

const LogoAndText = ({ icon, text }) => {
  return (
    <LogoAndTextWrapper>
      <LogoContainer>
        <Logo src={icon} />
      </LogoContainer>
      <div>{text}</div>
    </LogoAndTextWrapper>
  )
}

export default LogoAndText
