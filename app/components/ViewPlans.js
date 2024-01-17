import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useImmer } from "use-immer";

import { axiosPost } from "../axiosPost.js";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField } from "@mui/material";
import { Check, Add } from "@mui/icons-material";

import TableNoData from "./user/table-no-data.jsx";
import UserTableRow from "./user/user-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";
import { emptyRows, applyFilter, getComparator } from "./user/utils";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

// ----------------------------------------------------------------------

export default function ViewPlans({ currentApp, handleClose }) {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);
    const [plansObj, setPlansObj] = useImmer([]);

    const [page, setPage] = useImmer(0);
    const [order, setOrder] = useImmer("asc");
    const [orderBy, setOrderBy] = useImmer("username");
    const [filterName, setFilterName] = useImmer("");
    const [rowsPerPage, setRowsPerPage] = useImmer(5);

    const [allPlans, setAllPlans] = useImmer([]);
    const [newPlanObj, setNewPlanObj] = useImmer({
        plan_mvp_name: "",
        plan_startdate: null,
        plan_enddate: null,
        plan_app_acronym: currentApp,
    });

    const handleSort = (event, id) => {
        const isAsc = orderBy === id && order === "asc";
        if (id !== "") {
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(id);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    const handleFilterByName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    var dataFiltered = applyFilter({
        inputData: allPlans,
        comparator: getComparator(order, orderBy),
        filterInput: filterName,
        filterColumn: "username",
    });

    const notFound = !dataFiltered.length && !!filterName;

    const handleMulti = (event) => {
        setNewPlanObj((prevFormData) => ({
            ...prevFormData,
            groupname: event,
        }));
    };
    const handleNewPlanInput = (e) => {
        console.log(e);
        const { name, value } = e.target;
        setNewPlanObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleNewPlanValueNameInput = (value, name) => {
        setNewPlanObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    async function handleSubmitNewPlan(e) {
        e.preventDefault();

        // const response = await axiosPost("/user/new", { username: newPlanObj.username, password: newPlanObj.password, email: newPlanObj.email, groupname: newPlanObj.groupname.join(","), isactive: newPlanObj.isactive });

        // if (response.success) {
        //     //success new group
        //     appDispatch({ type: "flashMessage", success: true, message: response.message });
        //     //reset newUsr obj
        //     setNewPlanObj({ username: "", password: "", email: "", groupname: [], isactive: "active" });
        //     //get fresh data
        //     fetchAllUsers();
        //     fetchGroupNames();
        // } else {
        //     switch (response.errorCode) {
        //         case "ER_DUP_ENTRY": {
        //             appDispatch({ type: "flashMessage", success: false, message: "Username already exists" });
        //             break;
        //         }
        //         case "ER_PW_INVALID": {
        //             appDispatch({ type: "flashMessage", success: false, message: response.message });
        //             break;
        //         }
        //         case "ER_NOT_LOGIN": {
        //             appDispatch({ type: "logout" });
        //             appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
        //             break;
        //         }
        //         default: {
        //             console.log("uncaught error");
        //             appDispatch({ type: "flashMessage", success: false, message: response.message });
        //             break;
        //         }
        //     }
        // }
    }

    // fetch latest user data
    useEffect(() => {
        async function fetchTokenValidity() {
            const response = await axiosPost("/checktoken", {});
            if (response.success) {
                //login
                appDispatch({ type: "login", user: response.user });
                setCurrentUserObj({ groupname: response.user.groupname });
            } else {
                switch (response.errorCode) {
                    //invalid jwt so force logout
                    case "ER_JWT_INVALID": {
                        appDispatch({ type: "logout" });
                        appDispatch({ type: "flashMessage", success: false, message: "Invalid JWT token, please login again!" });
                        break;
                    }
                    case "ER_NOT_LOGIN": {
                        appDispatch({ type: "logout" });
                        appDispatch({ type: "flashMessage", success: false, message: "Please Login to access!" });
                        break;
                    }
                    default: {
                        console.log("uncaught error");
                        appDispatch({ type: "flashMessage", success: false, message: response.message });
                    }
                }
            }
        }
        async function fetchPlans() {
            const response = await axiosPost("/plan/getplans", { app_acronym: currentApp });
            if (response.success) {
                setPlansObj(response.message);
            } else {
                switch (response.errorCode) {
                    //invalid jwt so force logout
                    case "ER_JWT_INVALID": {
                        appDispatch({ type: "logout" });
                        appDispatch({ type: "flashMessage", success: false, message: "Invalid JWT token, please login again!" });
                        break;
                    }
                    case "ER_NOT_LOGIN": {
                        appDispatch({ type: "logout" });
                        appDispatch({ type: "flashMessage", success: false, message: "Please Login to access!" });
                        break;
                    }
                    default: {
                        console.log("uncaught error");
                        appDispatch({ type: "flashMessage", success: false, message: response.message });
                    }
                }
            }
        }
        fetchTokenValidity();
        fetchPlans();
    }, []);

    return (
        <>
            <Container sx={{ mt: 0 }}>
                <Card>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                        mr={3}
                    >
                        <UserTableToolbar
                            filterName={filterName}
                            onFilterName={handleFilterByName}
                        />

                        <form onSubmit={handleSubmitNewPlan}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                justifyContent="flex-end"
                            >
                                <TextField
                                    name="plan_mvp_name"
                                    type="text"
                                    value={newPlanObj.plan_mvp_name}
                                    onChange={(e) => handleNewPlanInput(e)}
                                    label="Plan Name"
                                    variant="outlined"
                                    required
                                    autoComplete="off"
                                    placeholder="Enter Plan Name"
                                    size="small"
                                />

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start-date"
                                        onChange={(e) => handleNewPlanValueNameInput(e, "plan_startdate")}
                                        slotProps={{ textField: { size: "small", required: true, value: newPlanObj.plan_startdate } }}
                                    />
                                </LocalizationProvider>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End-date"
                                        onChange={(e) => handleNewPlanValueNameInput(e, "plan_enddate")}
                                        slotProps={{ textField: { size: "small", required: true, value: newPlanObj.plan_enddate } }}
                                    />
                                </LocalizationProvider>

                                <Button
                                    variant="contained"
                                    type="submit"
                                    color="inherit"
                                >
                                    <Add />
                                </Button>
                            </Stack>
                        </form>
                    </Stack>

                    <TableContainer sx={{ overflow: "unset" }}>
                        <Table sx={{ minWidth: 800 }}>
                            <colgroup>
                                <col width="25%" />
                                <col width="25%" />
                                <col width="25%" />
                                <col width="25%" />
                            </colgroup>
                            <UserTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={allPlans.length}
                                onRequestSort={handleSort}
                                headLabel={[
                                    { id: "plan_mvp_name", label: "Plan Name" },
                                    { id: "plan_startdate", label: "Start-date" },
                                    { id: "plan_enddate", label: "End-date" },
                                ]}
                            />
                            <TableBody>
                                {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <UserTableRow
                                        key={row.username}
                                        password={"********"}
                                        username={row.username}
                                        email={row.email}
                                        groupname={row.groupname ? row.groupname.split(",").sort() : []}
                                        status={row.isactive}
                                        fetchAllUsers={fetchAllUsers}
                                        fetchGroupNames={fetchGroupNames}
                                        groupNameOptions={groupNameOptions}
                                    />
                                ))}
                                <TableEmptyRows
                                    height={77}
                                    emptyRows={emptyRows(page, rowsPerPage, allPlans.length)}
                                />

                                {notFound && <TableNoData query={filterName} />}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        page={page}
                        component="div"
                        count={allPlans.length}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        rowsPerPageOptions={[5, 10, 25]}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Container>
        </>
    );
}
