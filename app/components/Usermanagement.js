import React, { useEffect, useContext } from "react";
import Axios from "axios";
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import TableNoData from "./user/table-no-data.jsx";
import UserTableRow from "./user/user-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";
import { emptyRows, applyFilter, getComparator } from "./user/utils";
import { useImmer } from "use-immer";
import { Autocomplete } from "@mui/material";

import { Grid, Paper, TextField } from "@mui/material";

import MenuItem from "@mui/material/MenuItem";

import { Check, Add } from "@mui/icons-material";

import { axiosPost } from "../axiosPost.js";

import { useNavigate } from "react-router-dom";
// ----------------------------------------------------------------------

export default function Usermanagement() {
    const navigate = useNavigate();

    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [page, setPage] = useImmer(0);

    const [order, setOrder] = useImmer("asc");

    const [orderBy, setOrderBy] = useImmer("name");

    const [filterName, setFilterName] = useImmer("");

    const [rowsPerPage, setRowsPerPage] = useImmer(5);

    const [allUsers, setAlUsers] = useImmer([]);

    const [newGroupName, setNewGroupName] = useImmer("");

    const [newUsrObj, setNewUsrObj] = useImmer({
        username: "",
        password: "",
        email: "",
        userGroup: [],
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
        inputData: allUsers,
        comparator: getComparator(order, orderBy),
        filterName,
    });

    const handleMulti = (event) => {
        setNewUsrObj((prevFormData) => ({
            ...prevFormData,
            userGroup: event,
        }));
    };
    const handleNewUsrInput = (e) => {
        const { name, value } = e.target;
        setNewUsrObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    async function handleSubmitNewGroup(e) {
        e.preventDefault();

        const response = await axiosPost("/group/new", { groupName: newGroupName }, abortController);

        if (response.success) {
            //success new group
            appDispatch({ type: "flashMessage", success: true, message: response.message });
            setNewGroupName("");
            fetchAllUsers();
            fetchGroupNames();
        } else {
            switch (response.errorCode) {
                case "ER_CHAR_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: "Group Name cannot contain ',' commas" });
                    return;
                }
                case "ER_DUP_ENTRY": {
                    appDispatch({ type: "flashMessage", success: false, message: "Group Name already exists" });
                    return;
                }
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    navigate("/");
                    return;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }

    async function handleSubmitNewUser(e) {
        e.preventDefault();

        const response = await axiosPost("/user/new", { userId: newUsrObj.username, password: newUsrObj.password, email: newUsrObj.email, userGroup: newUsrObj.userGroup.join(",") }, abortController);

        if (response.success) {
            //success new group
            appDispatch({ type: "flashMessage", success: true, message: response.message });
            setNewUsrObj({ username: "", password: "", email: "", userGroup: [] });
            fetchAllUsers();
            fetchGroupNames();
        } else {
            switch (response.errorCode) {
                case "ER_DUP_ENTRY": {
                    appDispatch({ type: "flashMessage", success: false, message: "Username already exists" });
                    return;
                }
                case "ER_PW_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: "password needs to be 8-10char and contains alphanumeric and specialcharacter" });
                    return;
                }
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    navigate("/");
                    return;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }

    const notFound = !dataFiltered.length && !!filterName;

    const abortController = new AbortController();
    async function fetchGroupNames() {
        const response = await axiosPost("/group/getGroups", {}, abortController);

        if (response.success) {
            //success get groups
            let nameArr = response.message.map((a) => a.userGroup);
            appDispatch({ type: "setGroupNames", data: nameArr });
        } else {
            switch (response.errorCode) {
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    navigate("/");
                    return;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }
    async function fetchAllUsers() {
        const response = await axiosPost("/user/getusers", {}, abortController);

        if (response.success) {
            //success get groups
            setAlUsers(response.message);
        } else {
            switch (response.errorCode) {
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    navigate("/");
                    return;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }
    useEffect(() => {
        if (appState.loggedIn) {
            fetchAllUsers();
            fetchGroupNames();
        }
        return () => abortController.abort();
    }, [appState.loggedIn]);

    return (
        <Container sx={{ mt: 3 }}>
            <Card>
                <Stack direction="column" alignItems="flex-end" mt={3}>
                    <form onSubmit={handleSubmitNewGroup}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} mr={3}>
                            <TextField name="newGroupName" type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} label="New Group Name" variant="outlined" autoComplete="off" placeholder="Enter New Group Name" size="small" required />
                            <Button variant="contained" type="submit" color="inherit">
                                <Add />
                            </Button>
                        </Stack>
                    </form>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} mr={3}>
                        <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

                        <form onSubmit={handleSubmitNewUser}>
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                                <TextField name="username" type="text" value={newUsrObj.username} onChange={(e) => handleNewUsrInput(e)} label="Username" variant="outlined" required autoComplete="off" placeholder="Enter Username" size="small" />

                                <TextField name="password" type="password" value={newUsrObj.password} onChange={(e) => handleNewUsrInput(e)} label="Password" variant="outlined" required autoComplete="off" placeholder="Enter Password" size="small" />

                                <TextField name="email" type="text" value={newUsrObj.email} onChange={(e) => handleNewUsrInput(e)} label="Email" variant="outlined" autoComplete="off" placeholder="Enter Email" size="small" />

                                <Autocomplete
                                    sx={{}}
                                    onChange={(e, newvalue) => handleMulti(newvalue)}
                                    value={newUsrObj.userGroup}
                                    multiple
                                    id="tags-standard"
                                    options={appState.groupNames}
                                    getOptionLabel={(option) => option}
                                    disableCloseOnSelect
                                    renderOption={(props, option, { selected }) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: "space-between" }} {...props}>
                                            {option}
                                            {selected ? <Check color="info" /> : null}
                                        </MenuItem>
                                    )}
                                    renderInput={(params) => <TextField {...params} variant="outlined" label="Groups" placeholder="Group Names" size="small" sx={{ width: "300px" }} />}
                                />

                                <Button variant="contained" type="submit" color="inherit">
                                    <Add />
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Stack>

                <TableContainer sx={{ overflow: "unset" }}>
                    <Table sx={{ minWidth: 800 }}>
                        <colgroup>
                            <col width="12%" />
                            <col width="15%" />
                            <col width="23%" />
                            <col width="25%" />
                            <col width="10%" />
                            <col width="15%" />
                        </colgroup>
                        <UserTableHead order={order} orderBy={orderBy} rowCount={allUsers.length} onRequestSort={handleSort} headLabel={[{ id: "name", label: "Name" }, { id: "password", label: "password" }, { id: "email", label: "Email" }, { id: "role", label: "Role" }, { id: "isActive", label: "active", align: "center" }, { id: "" }]} />
                        <TableBody>
                            {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <UserTableRow key={row.userId} password={"********"} userId={row.userId} email={row.email} userGroup={row.userGroup} status={row.isActive} fetchAllUsers={fetchAllUsers} fetchGroupNames={fetchGroupNames} />
                            ))}

                            <TableEmptyRows height={77} emptyRows={emptyRows(page, rowsPerPage, allUsers.length)} />

                            {notFound && <TableNoData query={filterName} />}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination page={page} component="div" count={allUsers.length} rowsPerPage={rowsPerPage} onPageChange={handleChangePage} rowsPerPageOptions={[5, 10, 25]} onRowsPerPageChange={handleChangeRowsPerPage} />
            </Card>
        </Container>
    );
}
