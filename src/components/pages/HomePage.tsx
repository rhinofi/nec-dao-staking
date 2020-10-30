import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { Title } from "components/common/beehive/Title";
import { Box, Typography } from "@material-ui/core";
import { TimeIcon } from "components/common/Icons/time";

const TitleWrapper = styled.div`
  padding: 80px 0 12px 0;
`;

const PanelContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 17px;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 445px;
  height: 440px;
  margin: 15px;
  min-width: 290px;
  background: #172333;
  border-radius: 6px;
  padding: 15px;
`;

const PanelBodyTextWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const BadgeContainer = styled.div`
  display: flex;
`;

const PanelBodyText = styled.p`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 150%;
  padding: 0 17px 54px 17px;
  text-align: center;
  margin: 0;
  color: #a9abcb;
`;

const Badge = styled.div`
  background: linear-gradient(315deg, #ff8800 8.75%, #e2a907 100%);
  border-radius: 4px;
`;

const BadgeText = styled.div`
  padding: 8px;
  letter-spacing: -0.02em;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
`;

const PanelTitle = styled.div`
  color: #a9abcb;
  text-align: center;
  font-style: normal;
  font-weight: normal;
  padding: 5px 0 24px 0;
  font-size: 18px;
`;

const SubTitle = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
  padding-bottom: 24px;
`;

const MainTitle = styled.div`
  width: 100%;
  text-align: center;
`;

const TermContainer = styled.div`
  cursor: pointer;
  background: #1f2a3e;
  border-radius: 6px;
  padding: 12px 25px;
  display: flex;
  align-items: center;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  justify-self: flex-end;
  margin-bottom: 41px;
`;

const JoinText = styled.p`
  color: #a9abcb;
  font-family: Nunito;
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
`;

const JoinTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
`;

const HomePage: React.FC = () => {
  const history = useHistory();

  const goToBeehive = () => history.push("/beehive");

  const goToLockNec = () => history.push("/lock-nec");

  return (
    <>
      <TitleWrapper>
        <MainTitle>
          <Title afterElement={true} text={"Earn Rewards"} />{" "}
          <Title afterElement={false} text={"for Trading on DeversiFi and Staking $NEC"} />
        </MainTitle>
      </TitleWrapper>
      <PageWrapper>
        <Panel>
          <BadgeContainer>
            <Badge>
              <BadgeText>Ongoing</BadgeText>
            </Badge>
          </BadgeContainer>
          <PanelContent>
            <PanelTitle>Governance</PanelTitle>
            <SubTitle>
              Earn voting power <br /> over $NEC's Future
            </SubTitle>
            <PanelBodyTextWrapper>
              <PanelBodyText>
                Stake your $NEC to earn voting
                power in the DAO that governs the future of Nectar (necDAO). The necDAO controls 17,000 pledged ETH and is interlinked with DeversiFi.
              </PanelBodyText>
            </PanelBodyTextWrapper>
            <TermContainer onClick={goToLockNec}>
              {" "}
              <Box display="flex" alignItems="flex-end" paddingRight="5px">
                <TimeIcon />
              </Box>
              Long Term
            </TermContainer>
          </PanelContent>
        </Panel>
        <Panel>
          <BadgeContainer>
            <Badge>
              <BadgeText>Ongoing</BadgeText>
            </Badge>
          </BadgeContainer>
          <PanelContent>
            <PanelTitle>Beehive</PanelTitle>
            <SubTitle> Earn $NEC and $BAL <br /> Rewards </SubTitle>
            <PanelBodyTextWrapper>
              <PanelBodyText>
                Stake into the NEC/wETH Balancer pool to earn $NEC and $BAL.
                Get up to double the rewards by trading on DeversiFi.
              </PanelBodyText>
            </PanelBodyTextWrapper>
            <TermContainer onClick={goToBeehive}>
              <Box display="flex" alignItems="flex-end" paddingRight="5px">
                <TimeIcon />
              </Box>
              Twelve Weeks
            </TermContainer>
          </PanelContent>
        </Panel>
      </PageWrapper>
    </>
  );
};

export default HomePage;
