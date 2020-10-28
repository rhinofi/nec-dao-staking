import { Box, Button, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import Paper from "@material-ui/core/Paper";
import { RootStore } from "stores/Root";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { TradingVolumeDTO } from "types";
import dayjs from "dayjs";
import dotenv from "dotenv";
import styled from "styled-components";
import { withStyles } from "@material-ui/core/styles";

const timelockContract = require("../../../abi/TokenTimelock.json")

dotenv.config();

const parseDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY/MM/DD HH:mm:ss')
}

const Tinyletters = styled.div`
  font-size: 12px;
  color: #a9abcb;
`;
const TableWrapper = styled.div`
  max-width: 1100px;
  justify-content: center;
  margin: 50px auto;

  .MuiPaper-root {
    background: rgba(40, 50, 74, 0.5);
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const StyledTableBody = styled(TableBody)`
  .MuiTableRow-root {
    border-top: 1px solid #313b55;
    height: 82px;
  }
`;

const Orangeletters = styled(Typography)`
  font-size: 15px;
  font-weight: bold;
`;
const StepNumber = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  margin-right: 8px;
`;

const StatusCell = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: center;
`;

const HeaderText = styled(Typography)`
  color: rgba(169, 171, 203, 0.7) !important;
`;

const CustomizedTable = inject("root")(
  observer((props) => {

    const { beehiveStore, providerStore } = props.root as RootStore;
    const rows = beehiveStore.tableData
    const poolData = beehiveStore.poolData
    const necPrice =
      poolData && poolData.necPrice && Number(poolData.necPrice);

    useEffect(() => {
      beehiveStore.toggleCountdown(true)
      return () => {
        beehiveStore.toggleCountdown(false)
      }
    }, [])

    const claim = async (contractAddress: string) => {
      const tokenlockInstance = new providerStore.web3.eth.Contract(timelockContract.abi, contractAddress);
      const gasPrice = await providerStore.web3.eth.getGasPrice()
      const from = (await providerStore.getAccounts())[0]
      await tokenlockInstance.methods.release().send({ from, gas: 235000, gasPrice });
    }

    return (
      <TableWrapper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  <HeaderText variant={"h6"}>Period</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>Status</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>BPT Snapshot</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>24 Hr Vol Snapshot</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>Your Earned $NEC</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>Nec Unlock Date</HeaderText>
                </TableCell>
                <TableCell align="center">
                  <HeaderText variant={"h6"}>Claim</HeaderText>
                </TableCell>
              </TableRow>
            </TableHead>
            <StyledTableBody>
              {rows.map((row) => (
                <TableRow key={row.period}>
                  <TableCell component="th" scope="row">
                    <Typography variant={"body2"}>Period {row.period}</Typography>
                    <Tinyletters>{row.endDate ? `Ends in ${(parseDate(row.endDate))} UTC` : '-'}</Tinyletters>
                  </TableCell>
                  <TableCell align="right">
                    <StatusCell>
                      <StepNumber
                        style={{
                          background:
                            row.status === "Open" ? "#F2994A" : "#646A7A",
                        }}
                      />
                      <Typography variant={"body2"}>{row.status}</Typography>
                    </StatusCell>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection='column' alignItems="center">
                      <Box>
                        <Orangeletters align='center' variant={"h4"} color={"primary"}>
                          {row.snapshot1}{" "}
                        </Orangeletters>
                        {`\n`} <Tinyletters>{row.earnedNecPercent}%</Tinyletters>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection='column' alignItems="center">
                      <Box>
                        <Orangeletters align='center' variant={"h4"} color={"primary"}>
                          {`$${Number(row.tradingVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                        </Orangeletters>
                        {`\n`} <Tinyletters>x{Number(row.multiplier)}</Tinyletters>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection='column' alignItems="center">
                      <Box>
                        <Orangeletters align='center' variant={"h4"} color={"primary"}>
                          {row.earnedNec}{" "}
                        </Orangeletters>
                        {`\n`} <Tinyletters>${row.earnedNec ? (Number(row.earnedNec) * necPrice).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'}</Tinyletters>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection='column' alignItems="center">
                      <Box>
                        {row.unlockDate ? parseDate(row.unlockDate) : '-'} {`\n`}{" "}
                        <Tinyletters>{row.unlockDate ? `${(parseDate(row.unlockDate))} UTC` : '-'}</Tinyletters>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection='column' alignItems="center">
                      <Button
                        variant={"outlined"}
                        fullWidth={true}
                        color={"primary"}
                        disabled={dayjs().isBefore(dayjs(row.unlockDate))}
                        onClick={async () => await claim(row.contractAddress)}
                      >
                        Unlock Nec
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </StyledTableBody>
          </Table>
        </TableContainer>
      </TableWrapper>
    );
  })
);

export default CustomizedTable;
