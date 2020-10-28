import React, { useEffect } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { inject, observer } from "mobx-react";
import "components/App.scss";
import ReputationBoostrapper from "components/pages/ReputationBootstrapper";
import Web3Manager from "components/shell/Web3Manager";
import HomePage from "./pages/HomePage";
import Beehive from "./pages/Beehive";
import BeehiveGuide from "./pages/Beehive/BeehiveGuide";
import styled from "styled-components";
import { Typography, Link, ThemeProvider } from "@material-ui/core";
import NectarLogo from "assets/pngs/NECwithoutText.png";

import HexagonsBackground from "assets/svgs/hexagonsBackground.svg";
import { NectarTheme } from "./theme";
import { BeehiveLogin } from "./pages/Beehive/BeehiveLogin";
import { BeehiveAdmin } from "./pages/Beehive/BeehiveAdmin";
import { AppHeader } from "components/common/Header";

const AppBody = styled.div`
  height: calc(100% - 70px - 70px);
  max-height: calc(100% - 70px - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding-top: 70px;
`;

const Footer = styled.div`
  position: fixed;
  display: flex;
  justify-content: space-around;
  align-items: center;
  bottom: 0;
  width: 100%;
  height: 70px;
  background-color: #061722;
`;

const FooterText = styled(Typography)`
  color: rgba(169, 171, 203, 0.5);
  font-size: 14px;
  text-align: right;
`;

const FooterLogo = styled.img`
  height: 32px;
  width: 32px;
`;

const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(4.5deg, #040e14 19.19%, #061824 88.66%);
`;

const BackgroundWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
`;

const App = inject("root")(
  observer((props) => {
    useEffect(() => {
      const { beehiveStore } = props.root;
      beehiveStore.fetchNonUserData();
    }, []);

    return (
      <ThemeProvider theme={NectarTheme}>
        <AppWrapper>
          <BackgroundWrapper
            style={{ backgroundImage: `url(${HexagonsBackground})` }}
          >
            <HashRouter>
              <AppHeader />
              <AppBody>
                <Web3Manager>
                  <Switch>
                    <Route path="/beehive">
                      <Beehive />
                    </Route>
                    <Route path="/lock-nec">
                      <ReputationBoostrapper />
                    </Route>
                    <Route path="/beehive-guide">
                      <BeehiveGuide />
                    </Route>
                    <Route path="/login">
                      <BeehiveLogin />
                    </Route>
                    <Route path="/admin">
                      <BeehiveAdmin />
                    </Route>
                    <Route path="/">
                      <HomePage />
                    </Route>
                  </Switch>
                </Web3Manager>
                <Footer>
                  <FooterLogo src={NectarLogo} />
                  <Typography
                    variant={"body2"}
                    onClick={() =>
                      window.open(
                        "https://discord.com/invite/7x7YwYX",
                        "_blank"
                      )
                    }
                  >
                    <Link>Join Our Discord</Link>
                  </Typography>
                  <FooterText>Copyright @2020 DeversiFi</FooterText>
                </Footer>
              </AppBody>
            </HashRouter>
          </BackgroundWrapper>
        </AppWrapper>
      </ThemeProvider>
    );
  })
);

export default App;
