import React from 'react'
import styled from 'styled-components'
import NECLogo from 'assets/svgs/necdao-glow.svg'
import ActiveButton from 'components/common/buttons/ActiveButton'

const ConnectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 364px;
`

const Logo = styled.img`
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
`

const Title = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.4px;
  color: var(--white-text);
  margin-bottom: 14px;
`

const SubTitle = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.2px;
  color: #7A7F8E;
  margin-bottom: 40px;
`

const ButtonWrapper = styled.div`
  width: 200px;
`

const ConnectWallet = () => {
  return (
    <ConnectWrapper>
      <Logo src={NECLogo} />
      <Title>
        Connect Wallet
      </Title>
      <SubTitle>
        To start using the NecDAO Interface
      </SubTitle>
      <ButtonWrapper>
        <ActiveButton>
          Connect
        </ActiveButton>
      </ButtonWrapper>
    </ConnectWrapper>
  )
}

export default ConnectWallet
