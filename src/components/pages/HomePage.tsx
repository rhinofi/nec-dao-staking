import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {useHistory} from "react-router-dom";
import {Title} from "components/common/beehive/Title";
import {Box, Typography} from "@material-ui/core";
import {TimeIcon} from "components/common/Icons/time";
import {inject, observer} from "mobx-react";
import {PoolDataDTO} from "../../types";
import {RootStore} from "../../stores/Root";

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
  background: #191F30;
  border-radius: 6px;
  padding: 15px;
  
  &.highlighted {
    border: 2px solid #FF8800;
  }
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
  padding: 0 17px 24px 17px;
  text-align: center;
  margin: 0;
  color: #a9abcb;
`;

const Badge = styled.div`
  background: linear-gradient(315deg, #ff8800 8.75%, #e2a907 100%);
  border-radius: 4px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.div`
  padding: 0 8px;
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
  font-size: 30px;
  text-align: center;
  letter-spacing: -0.02em;
  color: #ffffff;
  padding-bottom: 16px;
`;

const MainTitle = styled.div`
  width: 100%;
  text-align: center;
`;

const TermContainer = styled.div`
  position: relative;
  cursor: pointer;
  background: #222B42;
  border-radius: 6px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  justify-self: flex-end;
  margin-bottom: 16px;
  height: 72px;
`;

const TermIcon = styled.div`
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  margin: auto;
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

const Button = styled.button`
  background: linear-gradient(315deg, #FF8800 8.75%, #E2A907 100%);
  border-radius: 4px;
  height: 48px;
  cursor: pointer;
  outline: none;
  border: none;
  font-family: Sen, sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16px;
  transition: opacity 0.1s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &.secondary {
    border: 1px solid #F2994A;
    background: transparent;
  }
`;

const HomePage = inject("root")(
    observer((props) => {
        const [poolData, setPoolData] = useState<PoolDataDTO>();

        const {beehiveStore} = props.root as RootStore;

        useEffect(() => {
            setPoolData(beehiveStore.poolData);
        }, [beehiveStore.poolData]);

        const history = useHistory();

        const goToBeehive = () => history.push("/beehive");

        const goToLockNec = () => history.push("/lock-nec");

        const apy = poolData && poolData.apy && Number(poolData.apy.toFixed(0));


        return (
            <>
                <TitleWrapper>
                    <MainTitle>
                        <Title afterElement={true} text={"Earn Rewards"} />{" "}
                        <Title afterElement={false} text={"For Staking Nectar $NEC"} />
                    </MainTitle>
                </TitleWrapper>
                <PageWrapper>
                    <Panel className='highlighted'>
                        <BadgeContainer>
                            <Badge>
                                <BadgeText>Ongoing</BadgeText>
                            </Badge>
                        </BadgeContainer>
                        <PanelContent>
                            <PanelTitle>Beehive</PanelTitle>
                            <SubTitle> Earn NEC and BAL <br />rewards with up to<br />{apy}% APY</SubTitle>
                            <PanelBodyTextWrapper>
                                <PanelBodyText>
                                    Stake into the NEC/wETH Balancer pool to earn $NEC and $BAL. Get up to double the
                                    rewards by trading on DeversiFi.
                                </PanelBodyText>
                            </PanelBodyTextWrapper>
                            <TermContainer onClick={goToBeehive}>
                                <TermIcon>
                                    <Box display="flex" alignItems="flex-end" paddingRight="5px">
                                        <TimeIcon />
                                    </Box>
                                </TermIcon>
                                Twelve Weeks
                            </TermContainer>
                            <Button onClick={goToBeehive}>
                                Start earning
                            </Button>
                        </PanelContent>
                    </Panel>
                    <Panel>
                        <BadgeContainer>
                            <Badge>
                                <BadgeText>Ongoing</BadgeText>
                            </Badge>
                        </BadgeContainer>
                        <PanelContent>
                            <PanelTitle>Governance</PanelTitle>
                            <SubTitle>
                                Earn voting power<br />over $NEC's future
                            </SubTitle>
                            <PanelBodyTextWrapper>
                                <PanelBodyText>
                                    Stake your $NEC to earn voting power in the DAO that governs the future of Nectar
                                    (necDAO). The necDAO controls 17,000 pledged ETH and is interlinked with DeversiFi.
                                </PanelBodyText>
                            </PanelBodyTextWrapper>
                            <TermContainer onClick={goToLockNec}>
                                <TermIcon>
                                    <Box display="flex" alignItems="flex-end" paddingRight="5px">
                                        <TimeIcon />
                                    </Box>
                                </TermIcon>
                                Long Term
                            </TermContainer>
                            <Button className='secondary' onClick={goToLockNec}>
                                Get started
                            </Button>
                        </PanelContent>
                    </Panel>
                </PageWrapper>
            </>
        );
    })
);

export default HomePage;
