import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import LogoAndText from 'components/common/LogoAndText'
import Tooltip from 'components/common/Tooltip'
import EthFinexLogo from 'assets/svgs/ethfinex-logo.svg'
import GENLogo from 'assets/svgs/GEN-logo.svg'
import StarIcon from 'assets/svgs/star.svg'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border);
  height: ${props => props.height};
`

const Title = styled.div`
  display: flex;
  flex-direction: row;
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  margin: 32px 0px;
  letter-spacing: 1px;
`

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const TotalRepWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const TotalRepText = styled.div`
  color: var(--enable-purple-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  margin: 24px 0px;
  letter-spacing: 1px;
`

const Star = styled.img`
  height: 12px;
  width: 12px;
`

const StarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  width: 20px;
  margin: 24px 12px 24px 0px;
  border-radius: 12px;
  border: 1px solid var(--enable-purple-text);
`

const ActiveButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--white-text);
  cursor: pointer;
  border: 1px solid var(--active-border);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  padding: 9px 0px;
  width: 156px;
`

const InactiveButton = styled(ActiveButton)`
  border: 1px solid var(--inactive-border);
  color: var(--inactive-header-text);
`

const Selector = ({ height }) => {
  const [selected, setSelected] = React.useState(0)

  const Button = withRouter(
    ({
      option, route, history, location, children
    }) => {
      // Handle external route navigation
      if (location.pathname === route) {
        setSelected(option)
      } else if (location.pathname === '/') {
        setSelected(0)
      }

      if (option === selected) {
        return (
          <ActiveButton>
            {children}
          </ActiveButton>
        )
      }
      return (
        <InactiveButton onClick={() => {
          setSelected(option)
          history.push(route)
        }}
        >
          {children}
        </InactiveButton>
      )
    }
  )

  return (
    <HeaderWrapper height={height}>
      <Title>
        How do you want to earn Reputation for the NectarDAO?
        <Tooltip title="Tooltip title" content="This is placeholder text describing the Title in the Selector." position="right top" />
      </Title>
      <NavWrapper>
        <Button option={1} route="/lock-nec">
          <LogoAndText icon={EthFinexLogo} text="Lock NEC" />
        </Button>
        <Button option={2} route="/airdrop">
          <LogoAndText icon={EthFinexLogo} text="Airdrop" />
        </Button>
        <Button option={3} route="/bid-gen">
          <LogoAndText icon={GENLogo} text="Bid GEN" />
        </Button>
      </NavWrapper>
      <TotalRepWrapper>
        <StarWrapper>
          <Star src={StarIcon} />
        </StarWrapper>
        <TotalRepText>{`Total Rewardable Reputation (Voting Power) - 1000000 REP`}</TotalRepText>
      </TotalRepWrapper>
    </HeaderWrapper>
  )
}

export default Selector
