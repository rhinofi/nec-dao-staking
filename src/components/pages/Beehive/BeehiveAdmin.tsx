import {
  AdminTableData,
  addBeneficiaries,
  deployContract,
  fetchWeeksData,
  getSnapshotCsv,
  publishWeek,
  schedulePeriods,
  signup,
  takeSnapshot,
} from "services/fetch-actions/httpApi";
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Container
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import BeehiveMultipleTable from "./BeehiveMultipleTable"
import DateFnsUtils from "@date-io/date-fns";
import dayjs from "dayjs";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.Ls.en.weekStart = 1;

const InputsContainer = styled.div`
  margin: auto;
  padding: 50px;
  max-height: 250px;
  overflow-y: auto;
  background: #172333;
  min-width: 300px;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 25px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const PickerWrapper = styled.div`
  .MuiPaper-root {
    background-color: #172333 !important;
  }
`;

const TableWrapper = styled.div`
  width: 90%;
  justify-content: center;
  margin: 50px auto;

  .MuiPaper-root {
    background: rgba(40, 50, 74, 0.5);
  }

  .MuiTableCell-root {
    border: none;
  }
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

export const BeehiveAdmin = inject("root")(
  observer((props) => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;
    const history = useHistory();
    const minDate = dayjs();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [weeks, setWeeks] = useState(0);
    const [scheduleStartDate, setScheduleStartDate] = useState(minDate);
    const [necPerWeek, setNecPerWeek] = useState({});
    const [rows, setRows] = useState<AdminTableData[]>([]);

    if (!isAuthenticated) {
      history.push("/login");
      return;
    }

    const fetchWeekData = async () => {
      try {
        const weeksData = await fetchWeeksData();
        setRows(weeksData);
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      fetchWeekData();
    }, []);

    const onSchedule = async () => {
      try {
        await schedulePeriods(necPerWeek, weeks, scheduleStartDate);
        await fetchWeekData();
        setNecPerWeek({});
        setWeeks(0);
      } catch (error) {
        console.log(error);
      }
    };

    const onTakeSnapshot = async (weekId: string) => {
      try {
        await takeSnapshot(weekId);
        await fetchWeekData();
      } catch (error) {
        console.log(error);
      }
    };

    const publishResults = async (weekId: string) => {
      try {
        await publishWeek(weekId);
        await fetchWeekData();
      } catch (error) {
        console.log(error);
      }
    };

    const redeployContract = async (weekId: string) => {
      try {
        await deployContract(weekId);
        await fetchWeekData();
      } catch (error) {
        console.log(error);
      }
    };

    const reAddBeneficiaries = async (weekId: string) => {
      try {
        await addBeneficiaries(weekId);
        await fetchWeekData();
      } catch (error) {
        console.log(error);
      }
    };

    const onLogout = () => {
      localStorage.removeItem("token");
      history.push("/");
    };

    const onSubmit = async () => {
      try {
        const response = await signup(email, password);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    const onChangeEmail = (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      console.log(event);
      setEmail(event.currentTarget.value);
    };

    const onChangePassword = (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      console.log(event);
      setPassword(event.currentTarget.value);
    };

    return (
      <>
        {" "}
        <PageWrapper>
          <InputsContainer>
            <Typography variant={"h4"} color={"primary"}>
              Schedule New Period
            </Typography>
            <Box paddingY="25px">
              <PickerWrapper>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker
                    minDate={minDate}
                    value={scheduleStartDate}
                    onChange={(date) => setScheduleStartDate(date as any)}
                  />
                </MuiPickersUtilsProvider>
              </PickerWrapper>
            </Box>
            <TextField
              type={"number"}
              label={"Weeks"}
              value={weeks}
              inputProps={{
                min: 0,
              }}
              onChange={(e) => setWeeks(Number(e.currentTarget.value))}
            />
            {Array.from(Array(weeks).keys()).map((x) => {
              return (
                <Box paddingY="25px">
                  <TextField
                    inputProps={{
                      min: 0,
                    }}
                    key={`nec-${x}`}
                    type={"number"}
                    label={`NEC to distribute on week #${x + 1}`}
                    value={necPerWeek[x]}
                    onChange={(e) =>
                      setNecPerWeek({
                        ...necPerWeek,
                        [`${x}`]: Number(e.currentTarget.value),
                      })
                    }
                  />
                </Box>
              );
            })}
            <Box paddingY="25px">
              <Button
                variant={"outlined"}
                color={"primary"}
                onClick={onSchedule}
                fullWidth={true}
              >
                Schedule
              </Button>
            </Box>
          </InputsContainer>
          <InputsContainer>
            <Typography variant={"h4"} color={"primary"}>
              Register new admin
            </Typography>
            <Grid container direction='column' spacing={3}>
              <Grid item>
                <TextField
                  placeholder={"Email"}
                  value={email}
                  onChange={onChangeEmail}
                />
              </Grid>
              <Grid item>
                <TextField
                  placeholder={"Password"}
                  type="password"
                  value={password}
                  onChange={onChangePassword}
                />
              </Grid>
            </Grid>

            <Button
              variant={"outlined"}
              color={"primary"}
              onClick={onSubmit}
              fullWidth={true}
            >
              Register
            </Button>
            <Button
              onClick={onLogout}
              variant="outlined"
              color="primary"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              Logout
            </Button>
          </InputsContainer>
        </PageWrapper>
        <Container>
          <BeehiveMultipleTable editable={true}/>
        </Container>
        <Box>
          <TableWrapper>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Period</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Start Date</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Status</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Nec To Distribute</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Nec Unlock Date</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Snapshot Date</HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>
                        Timelock Contract Address
                      </HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>
                        NEC to distribute with multiplier
                      </HeaderText>
                    </TableCell>
                    <TableCell align="left">
                      <HeaderText variant={"h6"}>Actions</HeaderText>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const weekIsFuture = dayjs
                      .utc(row.startDate)
                      .isAfter(dayjs.utc());
                    return (
                      <TableRow key={row.period}>
                        <TableCell component="th" scope="row">
                          <Typography variant={"body2"}>
                            Period {row.period}
                          </Typography>
                          <Typography variant={"h6"}>
                            Ends UTC {row.endDate}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          {row.startDate || "-"}
                        </TableCell>
                        <TableCell align="right">
                          <StatusCell>
                            <StepNumber
                              style={{
                                background:
                                  row.status === "Open" ? "#F2994A" : "#646A7A",
                              }}
                            />
                            <Typography variant={"body2"}>
                              {row.status}
                            </Typography>
                          </StatusCell>
                        </TableCell>
                        <TableCell align="left">
                          {row.necToDistribute}
                        </TableCell>
                        <TableCell align="left">
                          {row.unlockDate ? row.unlockDate : "-"}
                        </TableCell>
                        <TableCell align="left">
                          {row.snapshotDate ? row.snapshotDate : "-"}
                        </TableCell>
                        <TableCell
                          align="left"
                          style={{ wordBreak: "break-word" }}
                        >
                          {row.contractAddress ? row.contractAddress : "-"}
                        </TableCell>
                        <TableCell align="left">
                          {row.necToDistributeWithMultiplier ?? "-"}
                        </TableCell>
                        <TableCell align="left">
                          <Box
                            width="100%"
                            display="flex"
                            flexWrap="wrap"
                            maxWidth="400px"
                          >
                            <Button
                              size="small"
                              variant={"outlined"}
                              color={"primary"}
                              onClick={() => onTakeSnapshot(row.id)}
                              disabled={!!row.snapshotDate || weekIsFuture}
                            >
                              Take Snapshot
                            </Button>
                            <Button
                              size="small"
                              variant={"outlined"}
                              color={"primary"}
                              onClick={() => publishResults(row.id)}
                              disabled={row.status !== "Open" || weekIsFuture}
                            >
                              Publish Results and Close
                            </Button>
                            <Button
                              size="small"
                              variant={"outlined"}
                              color={"primary"}
                              onClick={() => redeployContract(row.id)}
                              disabled={
                                !row.snapshotDate || row.status === "Open"
                              }
                            >
                              Redeploy contract
                            </Button>
                            <Button
                              size="small"
                              variant={"outlined"}
                              color={"primary"}
                              onClick={() => reAddBeneficiaries(row.id)}
                              disabled={!row.contractAddress}
                            >
                              Add Beneficiaries
                            </Button>
                            <Button
                              size="small"
                              variant={"outlined"}
                              color={"primary"}
                              onClick={() => getSnapshotCsv(row.id)}
                              disabled={!row.snapshotDate}
                            >
                              Get Snapshot CSV
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>
        </Box>
      </>
    );
  })
);
