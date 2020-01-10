import React, { useState } from 'react'
import styled from 'styled-components'
import { observer, inject } from "mobx-react"
import NECLogo from 'assets/svgs/necdao-glow.svg'
import ActiveButton from './buttons/ActiveButton'
import LedgerModal from './LedgerModal'
import { Wallet } from '../../stores/Provider'

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

const Buttons = styled.div`
  display: flex;
  width: 500px;
  justify-content: space-between;
`

const ButtonWrapper = styled.div`
  width: 300px;
`

const ConnectWallet = inject('root')(observer((props) => {
  const [modal, toggleModal] = useState(false)
  return (
    <ConnectWrapper>
      <Logo src={NECLogo} />
      <Title>
        Connect Wallet
      </Title>
      <SubTitle>
        To start using the necDAO Interface
      </SubTitle>
      <Buttons>
        <ButtonWrapper>
          <ActiveButton onClick={() => { props.root.providerStore.setWallet(Wallet.METAMASK) }}>
            Connect Metamask
          </ActiveButton>
        </ButtonWrapper>
        <ButtonWrapper>
          <ActiveButton onClick={() => { toggleModal(true) }}>
            Connect Ledger
          </ActiveButton>
        </ButtonWrapper>
      </Buttons>
      {
        modal &&
        <LedgerModal toggleModal={toggleModal} />
      }
    </ConnectWrapper>
  )
}))

export default ConnectWallet
