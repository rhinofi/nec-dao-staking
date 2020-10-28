import React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import LockPanel from "components/panels/LockPanel";
import EnableTokenPanel from "components/panels/EnableTokenPanel";
import TimelineProgress from "components/common/TimelineProgress";
import LogoAndText from "components/common/LogoAndText";
import TokenValue from "components/common/TokenValue";
import icon from "assets/pngs/NECwithoutText.png";
import { deployed } from "config.json";
import BatchesTable from "components/tables/BatchesTable";
import UserLocksTable from "components/tables/UserLocksTable";
import LoadingCircle from "../../common/LoadingCircle";
import { RootStore } from "stores/Root";
import ExtendLockPanel from "components/panels/ExtendLockPanel";
import { instructions, text, tooltip } from "strings";
import * as helpers from "utils/helpers";

const LockNECWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  max-height: 500px;
  margin-top:48px;
`;

const DetailsWrapper = styled.div`
  min-width: 605px;
  height: 364px;
  border-right: 1px solid var(--border);
`;

const TableHeaderWrapper = styled.div`
  height: 103px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 24px;
  border-bottom: 1px solid var(--border);
`;

const TableTabEnumWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 103px;
`;

const TableTabButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 7.5px 14px;
  margin-left: 12px;
  background: var(--background);
  border: 1px solid var(--active-border);
  cursor: pointer;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 18px;
  color: var(--white-text);
`;
const ButtonExternal = styled.div`
 
  cursor: pointer;
  border: 1px solid #E2A907;
`
const InactiveTableTabButton = styled(TableTabButton)`
  color: var(--inactive-header-text);
  border: 1px solid var(--inactive-border);
`;

const ActionsWrapper = styled.div`
  width: 324px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`;

const ActionsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0px 24px;
  margin-top:96px;
  color: var(--white-text);
  border-bottom: 1px solid var(--border);
`;

enum TabEnum {
  YOUR_LOCKS,
  ALL_PERIODS,
}

type Props = {
  root: RootStore;
};

type State = {
  currentTab: TabEnum;
};

@inject("root")
@observer
class LockNEC extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: TabEnum.ALL_PERIODS,
    };
  }

  setCurrentTab(value) {
    this.setState({ currentTab: value });
  }

  getTimerVisuals() {
    const { lockNECStore, timeStore } = this.props.root as RootStore;

    const currentBatch = lockNECStore.getActiveLockingBatch();
    const finalBatch = lockNECStore.getFinalBatchIndex();
    const batchLength = lockNECStore.staticParams.batchTime;
    const isLockingStarted = lockNECStore.isLockingStarted();
    const isLockingEnded = lockNECStore.isLockingEnded();
    const finalBatchIndex = lockNECStore.getFinalBatchIndex();

    const now = timeStore.currentTime;

    const currentBatchDisplay = currentBatch + 1;
    const finalBatchIndexDisplay = finalBatchIndex + 1;

    let batchPercentage = 0;
    let batchTimer = "...";
    let batchStatus = 0;
    let batchTitle = `${text.currentBatchTitle}: ${currentBatchDisplay} of ${finalBatchIndexDisplay}`;

    let prefix = "Next in";

    if (!isLockingStarted) {
      prefix = "Starts in";
      batchTitle = "Locking not started";
    }

    if (currentBatch === finalBatch && !isLockingEnded) {
      prefix = "Ends in";
    }

    if (!isLockingStarted) {
      //TODO: Make the time 'until' the next
      // Percentage will be related to deployment time
      const timeUntilNextBatch = lockNECStore.getTimeUntilStartFrom(now);
      batchPercentage = (timeUntilNextBatch / batchLength) * 100;
      const timeUntilNextBatchDisplay = helpers.formatTimeRemaining(
        timeUntilNextBatch
      );
      batchTimer = `${prefix} ${timeUntilNextBatchDisplay}`;
    }

    // Locking In Progress
    if (isLockingStarted && !isLockingEnded) {
      const timeUntilNextBatch = Number(lockNECStore.getTimeUntilNextBatch());
      batchPercentage = (timeUntilNextBatch / batchLength) * 100;
      const timeUntilNextBatchDisplay = helpers.formatTimeRemaining(
        timeUntilNextBatch
      );
      batchTimer = `${prefix} ${timeUntilNextBatchDisplay}`;
    }

    // Locking Ended
    if (isLockingEnded) {
      batchPercentage = 100;
      batchTimer = "";
      batchTitle = "Locking has ended";
    }

    return {
      batchPercentage,
      batchTimer,
      batchStatus,
      batchTitle,
    };
  }

  renderTable(currentTab) {
    if (currentTab === TabEnum.YOUR_LOCKS) {
      return <UserLocksTable />;
    } else if (currentTab === TabEnum.ALL_PERIODS) {
      return <BatchesTable highlightTopRow />;
    }
  }

  TabButton = (currentTab, tabType, tabText) => {
    if (currentTab === tabType) {
      return (
        <TableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </TableTabButton>
      );
    } else {
      return (
        <InactiveTableTabButton onClick={() => this.setCurrentTab(tabType)}>
          {tabText}
        </InactiveTableTabButton>
      );
    }
  };

  render() {
    const { lockNECStore, providerStore, tokenStore, txTracker } = this.props
      .root as RootStore;
    const { currentTab } = this.state;
    const userAddress = providerStore.getDefaultAccount();
    const necTokenAddress = deployed.NectarToken;
    const spenderAddress = deployed.ContinuousLocking4Reputation;

    // Check Loading Conditions
    const staticParamsLoaded = lockNECStore.areStaticParamsLoaded();
    const hasBalance = tokenStore.hasBalance(necTokenAddress, userAddress);
    const hasAllowance = tokenStore.hasAllowance(
      necTokenAddress,
      userAddress,
      spenderAddress
    );

    //TODO Update this to proper logic for handling ConnectWallet and ConnectMainNet Screens
    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return <LoadingCircle instruction={"Loading..."} subinstruction={""} />;
    }

    const tokenApproved = tokenStore.hasMaxApproval(
      necTokenAddress,
      userAddress,
      spenderAddress
    );
    const approvePending = tokenStore.isApprovePending(
      necTokenAddress,
      userAddress,
      spenderAddress
    );
    const lockPending = txTracker.isLockActionPending();
    const extendPending = txTracker.isExtendLockActionPending();

    const isLockingStarted = lockNECStore.isLockingStarted();
    const isLockingEnded = lockNECStore.isLockingEnded();

    const userHasLocks = lockNECStore.userHasLocks(userAddress);
    const necBalance = tokenStore.getBalance(necTokenAddress, userAddress);

    const timerVisuals = this.getTimerVisuals();

    const { batchPercentage, batchTimer, batchTitle } = timerVisuals;

    return (
      <LockNECWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={batchPercentage}
              title={batchTitle}
              subtitle={batchTimer}
              width="28px"
              height="28px"
              displayTooltip={true}
              tooltipContent={tooltip.lockTokenExplainer}
            />
            {isLockingStarted ? (
              <TableTabEnumWrapper>
                {this.TabButton(
                  currentTab,
                  TabEnum.ALL_PERIODS,
                  text.allBatchesTab
                )}
                {this.TabButton(
                  currentTab,
                  TabEnum.YOUR_LOCKS,
                  text.yourLocksTab
                )}
              </TableTabEnumWrapper>
            ) : (
              <React.Fragment></React.Fragment>
            )}
          </TableHeaderWrapper>
          {this.renderTable(currentTab)}
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={icon} text="Nectar" />
            <TokenValue weiValue={necBalance} tokenName="NEC" />
          </ActionsHeader>
          <React.Fragment>
            {tokenApproved === false ? (
              <EnableTokenPanel
                instruction={instructions.enableLock}
                pendingInstruction={instructions.pending.enableLock}
                subinstruction="-"
                buttonText="Enable NEC"
                userAddress={userAddress}
                tokenAddress={necTokenAddress}
                spenderAddress={spenderAddress}
                enabled={tokenApproved}
                pending={approvePending}
              />
            ) : currentTab === TabEnum.ALL_PERIODS ? (
             
              <LockPanel
                buttonText="Lock NEC"
                userAddress={userAddress}
                enabled={isLockingStarted && !isLockingEnded}
                pending={lockPending}
              /> 
            ) : (
              <ExtendLockPanel
                buttonText="Extend Lock"
                userAddress={userAddress}
                enabled={isLockingStarted && !isLockingEnded}
                pending={extendPending}
                hasLocks={userHasLocks}
              />
            )}
          </React.Fragment>
        </ActionsWrapper>
      </LockNECWrapper>
    );
  }
}

export default LockNEC;
