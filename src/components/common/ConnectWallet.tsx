import React, { useState } from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import NECLogo from "assets/svgs/necdao-glow.svg";
import MetamaskLogo from "assets/svgs/metamask.svg";
import LedgerLogo from "assets/svgs/ledger.svg";
import ActiveButton from "./buttons/ActiveButton";
import LedgerModal from "./LedgerModal";
import { Wallet } from "../../stores/Provider";
import { Box, Grid, Typography } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";

const SubTitle = styled.p`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  text-align: center;
  line-height: 20px;
  letter-spacing: 0.2px;
  color: #7a7f8e;
  margin: 0 0 40px 0;
`;

const ConnectButton = styled.div`
  display: flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  background: rgba(40, 50, 74, 0.5);
  width: 255px;
  border-radius: 6px;
  height: 104px;
`;

const MetamaskWalletLogo = styled.img`
  width: 150px;
`;

const LedgerWalletLogo = styled.img`
  width: 135px;
`;

const Alert = styled(Box)`
  background: linear-gradient(
    315deg,
    rgba(255, 136, 0, 0.2) 8.75%,
    rgba(226, 169, 7, 0.2) 100%
  );
  color: #f2994a;
  height: auto;
  width: 100%;
  border-radius: 6px;
`;

const AlertContent = styled.div`
  white-space: pre-wrap;
  padding: 12px;
  display: flex;
  justify-content: center;
`;

const ConnectWallet = inject("root")(
  observer((props) => {
    const [modal, toggleModal] = useState(false);
    return (
      <Box width="100%" paddingTop="50px">
        <Grid container justify="center">
          <Box width="541px" height="364px">
            <SubTitle>Please connect your Ethereum wallet to continue</SubTitle>
            <Box paddingBottom='25px' width='100%'>
              <Grid container spacing={2} justify='center'>
                <Grid item>
                  <ConnectButton
                    onClick={() => {
                      props.root.providerStore.setWallet(Wallet.METAMASK);
                    }}
                  >
                    <MetamaskWalletLogo src={MetamaskLogo} />
                  </ConnectButton>
                </Grid>
                <Grid item>
                  <ConnectButton
                    onClick={() => {
                      toggleModal(true);
                    }}
                  >
                    <LedgerWalletLogo src={LedgerLogo} />
                  </ConnectButton>
                </Grid>
              </Grid>
            </Box>
            {modal && <LedgerModal toggleModal={toggleModal} />}
            {props.warning && (
              <Alert>
                <AlertContent>
                  <WarningIcon
                    style={{
                      padding: "5px 12px 0 0",
                      color:
                        "linear-gradient(315deg, #FF8800 8.75%, #E2A907 100%);",
                    }}
                  />
                  <Typography variant='body2' color='inherit'>
                    Warning: You are on the wrong network, please switch to
                    Ethereum mainnet
                  </Typography>
                </AlertContent>
              </Alert>
            )}
          </Box>
        </Grid>
      </Box>
    );
  })
);

export default ConnectWallet;
