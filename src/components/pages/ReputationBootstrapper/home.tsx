import React from 'react'
import { withRouter } from 'react-router-dom'
import LogoAndText from 'components/common/LogoAndText'
import Tooltip from 'components/common/Tooltip'
import EthFinexLogo from 'assets/pngs/NECwithoutText.png'
import NECLogo from 'assets/svgs/necdao-glow.svg'
import GENLogo from 'assets/svgs/GEN-logo.svg'
import StarIcon from 'assets/svgs/star.svg'
import styled from 'styled-components'
import { lockNEC, bidGEN, airdrop } from 'config.json'
import { tooltip } from 'strings'


const BigWrap = styled.div`
  margin: 0 auto;

`
const HeaderWrapper = styled.div`
  display: inline-block;
  width:100%;
  flex-direction: column;
  align-items: center;
  align-self: top;
  
`
const Logo = styled.img`
  width: 64px;
  height: 64px;
  display:inline-block;
  float:left;
`
const Title = styled.div`
  display: flex;
  margin: 0 auto;
  color: var(--white-text);
  white-space:nowrap;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 30px;
  line-height: 60px;
  text-align: center;
  letter-spacing: 1px;
  width:25%;
  float:center;
  
`
const Biodiv = styled.div `
display: flex;
  position:static;
  flex-direction: row;
  width: 45%;
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 14px;
  text-align: left;
  letter-spacing: 1px;
  float:center;
  margin:0 auto;
`

  
const Instructbox = styled.div`
display: inline-block;
  flex-direction: column;
  text-align:center;

  color: var(--white-text);
  cursor: pointer;
  border: 1px solid var(--active-border);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  height: 30px;
  white-space:wrap;
  padding: 0px 0px;
  margin: 7.5px;
  vertical-align:top;
  float: center;
  width: auto;`

  
 const InstrucText = styled.div`
 
 display: inline-block;
  flex-direction: column;
  align-items: inline;
  color: var(--white-text);
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  height:15px;
  font-size: 7.5px;
  line-height: 15px;
  margin: 5px;
  float: center;
  width: 156px;
  height:20px;
 `
 const StatsHolder = styled.div`
 align-items:center;
 width:100%;
 text-align:center;
  margin: 15px 0px; 
 `

 const Statsbox = styled.div`
display: inline-block;
  flex-direction: column;
  
  color: var(--white-text);
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  height: 30px;
  
  white-space:wrap;
  padding: 0px 0px;
  margin: 10px 60px;
  vertical-align:top;
  float: center;
  width: auto;`
 
const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
`
const TotalRepWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const TotalRepText = styled.div`
  color: #A9ABCB;
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

const getCurrentSchemeTotalRep = (pathname) => {
  switch (pathname) {
    case '/lock-nec':
      return lockNEC.totalRep
    case '/bid-gen':
      return bidGEN.totalRep
    case '/airdrop':
      return airdrop.totalRep
    case '/':
      return lockNEC.totalRep
  }
}

const Selector = withRouter((props) => {
  const { height } = props
  const [selected, setSelected] = React.useState(0)

  const currentSchemeTotalRep = getCurrentSchemeTotalRep(props.location.pathname)

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
    <BigWrap>

        <HeaderWrapper style={{ height }}>
        <Logo src={NECLogo} />

      <Title>
        Nectar Beehive V1
      </Title>
      <Biodiv>

      <Tooltip title="" content={tooltip.necDAOBasics} position="right top" />
        Earn $NEC nd $BAL for Staking into the Balancer NEC/wEth Pool
        </Biodiv>
        </HeaderWrapper>
         <StatsHolder>
           <Statsbox>test</Statsbox>
           <Statsbox>test</Statsbox>
           <Statsbox>test</Statsbox>
           <Statsbox>test</Statsbox>

         </StatsHolder>
        <Instructbox><InstrucText>Stake into the NEC/wETH Balancer Pool to Receive BPT</InstrucText></Instructbox>
        <Instructbox><InstrucText>Hold the BPT in your Private Wallet</InstrucText></Instructbox>
        <Instructbox><InstrucText>Earn $NEC, $BAL and necDAO Reputation </InstrucText></Instructbox>
        <Instructbox><InstrucText>Claim your $NEC Rewards in 12 Months</InstrucText></Instructbox>
        <Instructbox><InstrucText>Read the Full Beehive Guide</InstrucText></Instructbox>
      <NavWrapper>
      
      </NavWrapper>
      <TotalRepWrapper>
        <StarWrapper>
          <Star src={StarIcon} />
        </StarWrapper>
        <TotalRepText>{`Total Rewardable Reputation (Voting Power) - ${currentSchemeTotalRep} REP`}</TotalRepText>
      </TotalRepWrapper>
    </BigWrap>
  )
})

export default Selector
