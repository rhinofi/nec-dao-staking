import React from "react";
import { observer, inject } from "mobx-react";
import Countdown from "react-countdown";
import styled from "styled-components";
import dayjs from "dayjs";
import { RootStore } from "stores/Root";
import { Box, Grid, Typography } from "@material-ui/core";
import { TimeIcon } from "../Icons/time";

const CountdownBody = styled(Box)`
  padding: 15px 20px;
  background: #28324a;
  border-radius: 6px;
`;

const Bold = styled.span`
  font-weight: bold !important;
  color: #ffffff !important;
`;

export const BeehiveCountdown = inject("root")(
  observer((props) => {
    const { beehiveStore } = props.root as RootStore;

    const nextWeek = beehiveStore.tableData.find(
      (row) => row.status === "Open"
    );

    console.log(nextWeek);

    return (
      nextWeek && (
        <Countdown
          date={dayjs(nextWeek.endDate).unix() * 1000}
          renderer={({ hours, days, minutes }) => {
            return (
              <CountdownBody>
                <Grid container spacing={5} justify="space-between" alignItems="center">
                  <Grid container item xs={6} alignItems="center">
                    <Box display='flex' alignItems='center'>
                      <TimeIcon/>
                      <Typography
                        color="textSecondary"
                        variant="body1"
                        style={{ fontFamily: "Montserrat", letterSpacing: 1 }}
                      >
                        <Bold>{days}</Bold>D:<Bold>{hours}</Bold>H:
                        <Bold>{minutes}</Bold>m
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      color="textSecondary"
                      variant="body2"
                      align='right'
                      style={{ fontFamily: "Montserrat" }}
                    >
                      Period {nextWeek.period} of{" "}
                      {beehiveStore.tableData.length}
                    </Typography>
                  </Grid>
                </Grid>
              </CountdownBody>
            );
          }}
        />
      )
    );
  })
);
