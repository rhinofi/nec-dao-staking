import { Button, IconButton, Link, Modal } from "@material-ui/core";
import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import BeehiveMultipleTable from "./BeehiveMultipleTable"
import { Close } from "@material-ui/icons";
import { RootStore } from "stores/Root";
import { Title } from "../../../components/common/beehive/Title";
import { Typography } from "@material-ui/core";
import styled from "styled-components";

const CenterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px 65px 95px 65px;
`;

const TitleHolder = styled.div`
  text-align: center;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  min-height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 32px;
  background: #e2a907;
  border-radius: 100px;
`;

const StepBox = styled.div`
  padding-top: 40px;
`;

const StepWrapper = styled.div`
  display: flex;
`;

const GuideHead = styled.div``;
const Subtitle = styled.div`
  color: #a9abcb;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  margin-top: 10px;
`;

const StyledModal = styled(Modal)`
  max-width: 1068px;
  margin: auto;
  height: 815px;
  overflow-y: auto;
`;

const StepTextWrapper = styled.div`
  padding-left: 17px;
`;

const GoToNecButton = styled(Button)`
  width: 300px;
  margin-top: 12px !important;
`;

const BodyText = styled(Typography)`
  padding-top: 15px;
  cursor: pointer;
  color: rgba(169, 171, 203, 0.8) !important;
`;

const BalanceText = styled(BodyText)`
  padding: 16px;
`;

const BalanceNumberText = styled(Typography)`
  padding-left: 8px;
  display: inline-block;
`;

const BPTBalance = styled.div`
  background: rgba(5, 15, 22, 0.5);
  border: 1px solid #404b67;
  box-sizing: border-box;
  border-radius: 6px;
  width: fit-content;
  height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px 0 20px 0;
`;

const CloseIconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const BackgroundWrapper = styled.div`
  background-color: #222b42;
  outline: none;
`;

const CloseIcon = styled(IconButton)`
  padding: 16px;
  color: #ffffff !important;
  font-size: 16px;
`;

const AppLink = styled(Link)`
  cursor: pointer
`

const BeehiveGuide: React.FC<any> = inject("root")(
  observer((props) => {
    const { beehiveStore } = props.root as RootStore;

    return (
      <StyledModal
        {...props}
        aria-labelledby="beehive-guide"
        disableAutoFocus={true}
      >
        <BackgroundWrapper>
          <CloseIconContainer>
            <CloseIcon onClick={props.onClose}>
              <Close />
            </CloseIcon>
          </CloseIconContainer>
          <CenterWrapper>
            <GuideHead>
              <TitleHolder>
                <Title text={"Walkthrough guide"} afterElement={true} />

                <Subtitle>
                  Join Our{" "}
                  <a
                    style={{ color: "#E2A907" }}
                    href="https://discord.com/invite/7x7YwYX"
                    target="_blank"
                  >
                    Discord{" "}
                  </a>{" "}
                  to Discuss Beehive
                </Subtitle>
              </TitleHolder>
            </GuideHead>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    1
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    Stake NEC & wETH into the Balancer Pool
                  </Typography>
                  <BodyText variant={"body2"}>
                    Use your NEC and ETH to stake into the NEC/wETH Balancer Exchange pool.
                    You can turn your ETH into wETH on the Balancer front-end.
                    Warning - Please only stake if you are familar with the concept of impernament loss that can result from AMMs
                  </BodyText>

                  <BodyText variant={"body2"} onClick={() => window.open('https://pools.balancer.exchange/#/pool/0xb21e53d8bd2c81629dd916eeAd08d338e7fCC201', "_blank")}>
                    <Link>NEC/wETH Balancer Pool</Link>
                  </BodyText>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    2
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    Hold the BPT in your Private Wallet
                  </Typography>
                  <BodyText variant={"body2"}>
                    To be eligible for Beehive rewards you simply need to hold the BPT tokens in your private wallet.
                    Beehive has been designed so that you pay as little gas as possible - you dont need to stake your BPT tokens anywhere
                  </BodyText>
                  <BPTBalance>
                    <BalanceText variant={"body2"}>
                      Your BPT Balance:{" "}
                      <BalanceNumberText
                        variant={"body2"}
                        color={"textPrimary"}
                      >
                        {Number(Number(beehiveStore.bptBalance).toFixed(4))}
                      </BalanceNumberText>
                    </BalanceText>
                  </BPTBalance>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    3
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    Trade On DeversiFi to Earn NEC Reward Multiples
                  </Typography>
                  <Typography variant={"body2"} color={"textSecondary"} style={{ paddingTop: 15 }}>
                    Head to{" "}
                    <AppLink
                      onClick={() =>
                        window.open("https://app.deversifi.com", "_blank")
                      }
                    >
                      app.deversifi.com
                    </AppLink>
                    , connect your wallet and trade to earn NEC reward
                    multiples
                  </Typography>
                  <BeehiveMultipleTable editable={false}/>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    4
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    Wait for Weekly BPT Snapshot
                  </Typography>
                  <BodyText variant={"body2"}>
                    Once per week,
                    a hidden snapshot will be taken to determine $NEC rewards.
                    After the week has ended, the results will be published and
                    your earned NEC rewards will be displayed in the Beehive
                    dashboard
                  </BodyText>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    5
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    BAL Rewards Sent Directly To Your Wallet
                  </Typography>
                  <BodyText variant={"body2"}>
                    BPT rewards will be sent to your wallet
                    weekly. These rewards are independent of DeversiFi and
                    therefore the process for claiming the BAL rewards may
                    change
                  </BodyText>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>

            <StepBox>
              <StepWrapper>
                <StepNumber>
                  <Typography variant={"h4"} color={"textPrimary"}>
                    6
                  </Typography>
                </StepNumber>
                <StepTextWrapper>
                  <Typography
                    variant={"h4"}
                    align={"left"}
                    color={"textPrimary"}
                    style={{ fontWeight: "bold" }}
                  >
                    Claim Your NEC Rewards
                  </Typography>
                  <BodyText variant={"body2"}>
                    In 12 months time, you will be able to unlock your NEC rewards from the smart contract
                  </BodyText>
                </StepTextWrapper>
              </StepWrapper>
            </StepBox>
          </CenterWrapper>
        </BackgroundWrapper>
      </StyledModal>
    );
  })
);

export default BeehiveGuide;
