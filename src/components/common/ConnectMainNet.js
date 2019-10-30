import React from 'react'
import styled from 'styled-components'
import NetworkImage from 'assets/svgs/necdao-network.svg'

const ConnectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 364px;
`

const Title = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.4px;
  color: var(--white-text);
  margin-bottom: 49px;
`

const SubTitle = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.4px;
  color: #7A7F8E;
  margin-bottom: 32px;
`

const Logo = styled.img`
  width: 159px;
  height: 127px;
`

const ConnectMainNet = ({}) => {
  return (
    <ConnectWrapper>
      <Title>
        Something is not right
      </Title>
      <SubTitle>
        Please connect to the Ethereum Main Network
      </SubTitle>
      <Logo src={NetworkImage} />
    </ConnectWrapper> 
  )
}

export default ConnectMainNet
