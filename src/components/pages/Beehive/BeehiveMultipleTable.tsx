// @ts-nocheck

import { addRewardMultiples } from "services/fetch-actions/httpApi";
import { inject, observer } from "mobx-react";

import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import Remove from "@material-ui/icons/Remove";
import { RootStore } from "stores/Root";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import dotenv from "dotenv";
import { forwardRef } from "react";
import { Button } from "@material-ui/core";
import { isEqual } from "lodash";
import { Typography } from "@material-ui/core";
import styled from "styled-components";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

dotenv.config();

const TableText = styled(Typography)`
  color: rgba(169, 171, 203, 0.8) !important;
`;

const CustomizedTable = inject("root")(
  observer((props) => {
    const { beehiveStore } = props.root as RootStore;
    const [storedTableState, setStoredTableState] = useState();
    const [tableState, setTableState] = useState();
    const [newInfo, infoIsNew] = useState(false);

    useEffect(() => {
      const isNew = !isEqual(tableState, storedTableState);
      infoIsNew(isNew);
    }, [tableState]);

    useEffect(() => {
      (async () => {
        await beehiveStore.fetchMultipleTableData();
        setStoredTableState(beehiveStore.multipleTableData);
        setTableState(beehiveStore.multipleTableData);
      })();
    }, []);

    const storeInformation = async () => {
      await addRewardMultiples(tableState);
      setStoredTableState(tableState);
      infoIsNew(false);
    };

    const { editable } = props;
    const editableProps =
      editable === false
        ? null
        : {
            onRowAdd: async function (newData: any) {
              try {
                setTableState([...tableState, newData]);
              } catch (error) {
                console.error(error);
                throw error;
              }
            },
            onRowUpdate: async function (newData: any, oldData: any) {
              try {
                const updatedData = tableState.map((data) => {
                  if (data.tableData.id === oldData.tableData.id) {
                    return { ...oldData, ...newData };
                  }
                  return data;
                });

                setTableState(updatedData);
              } catch (error) {
                console.error(error);
                throw error;
              }
            },
            onRowDelete: async function (oldData: any) {
              try {
                const newData = tableState.filter((data) => {
                  return !(data.tableData.id === oldData.tableData.id);
                });

                setTableState(newData);
              } catch (error) {
                console.error(error);
                throw error;
              }
            },
          };

    const columns = [
      {
        title: "24 Hr Volume At Snapshot",
        field: "lower_limit",
        type: "numeric",
        align: "left",
        render: (rowData: any) => {
          const lowerLimit = rowData.lower_limit
          const limit = editable ? lowerLimit : Number(lowerLimit).toLocaleString('en-US', { maximumFractionDigits: 0 })
          return <TableText variant={"body2"}>{`$${limit}`}</TableText>;
        },
        cellStyle: {
          border: "none",
        },
      },
      {
        title: "Multiple",
        field: "multiplier",
        type: "numeric",
        align: "center",
        render: (rowData: any) => {
          return <TableText variant={"body2"}>{rowData.multiplier}</TableText>;
        },
        cellStyle: {
          border: "none",
        },
      },
    ];

    const editableColumns = [...columns];

    return (
      <>
        <MaterialTable
          icons={tableIcons}
          editable={editableProps}
          columns={editable ? editableColumns : columns}
          data={tableState}
          style={{
            background: "rgba(5, 15, 22, 0.5)",
            border: "1px solid #404b67",
            boxSizing: "border-box",
            borderRadius: "6px",
            margin: "15px 0 20px 0",
            maxWidth: "530px"
          }}
          options={{
            paging: false,
            search: false,
            showTitle: false,
            toolbar: editable,
            headerStyle: {
              backgroundColor: "inherit",
              fontSize: "16px",
              fontStyle: "normal",
              fontFamily: "Sen",
              fontWeight: "normal",
              lineHeight: "24px",
              letterSpacing: "0.01071em",
              color: "rgba(169,171,203,0.8)",
              border: 'none'
            },
          }}
        />
        {newInfo && (
          <Button onClick={storeInformation} variant="outlined">
            Save
          </Button>
        )}
      </>
    );
  })
);

export default CustomizedTable;
