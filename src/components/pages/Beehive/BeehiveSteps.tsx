import React from "react";
import { withRouter } from "react-router-dom";
import Tooltip from "components/common/Tooltip";
import NECLogo from "assets/svgs/necdao-glow.svg";
import styled from "styled-components";
import { tooltip } from "strings";
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  text-align: center;
`;

const CenterWrapper = styled.div`
  display: flex;
  width: 1068px;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  margin: 0 auto 0 auto;
`;

const Logo = styled.img`
  width: 93px;
  height: 93px;
`;
const Title = styled.div`
  color: var(--white-text);
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 25px;
  line-height: 60px;
  text-align: center;
  letter-spacing: 1px;
`;






const InstructDiv = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  width: 100%;
  text-align: center;
`;

const InstructBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: var(--white-text);
  justify-content: center;
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 400;
  border: 1px solid var(--active-border);
  font-size: 12px;
  padding: 8px;
  margin: 5px;
  width: 156px;
`;

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

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
`;

const GuideBox = styled.div``

const InactiveButton = styled(ActiveButton)`
  border: 1px solid var(--inactive-border);
  color: var(--inactive-header-text);
`;

const Subtitle = styled.div`
  padding-left: 10px;
`;

const BeehiveSteps = withRouter((props , { history }) => {
  const { height } = props;
  const [selected, setSelected] = React.useState(0);

  return (
    <>
   
        <CenterWrapper>
         

          <InstructDiv>
            <InstructBox>
              Stake into the NEC/wETH Balancer Pool to Receive BPT{" "}
            </InstructBox>
            <InstructBox>Earn $NEC, $BAL and necDAO Reputation </InstructBox>
            <InstructBox>Participate in necDAO Governance</InstructBox>
            <InstructBox>Claim your $NEC Rewards in 12 Months</InstructBox>

             <InstructBox><GuideBox><Button component={Link} to="/beehive-guide">
  Read the Full Beehive Guide
</Button></GuideBox></InstructBox>
          </InstructDiv>

        </CenterWrapper>
      

      <NavWrapper></NavWrapper>
    </>
  );
});

export default BeehiveSteps;
