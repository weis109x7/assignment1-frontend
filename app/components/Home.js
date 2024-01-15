import React, { useContext, useEffect } from "react";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { useImmer } from "use-immer";
import { axiosPost } from "../axiosPost.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField } from "@mui/material";
import { Check, Add } from "@mui/icons-material";
import Modal from "@mui/material/Modal";

import TableNoData from "./user/table-no-data.jsx";
import AppTableRow from "./user/app-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";

import { emptyRows, applyFilter, getComparator } from "./user/utils";
import CreateApp from "./CreateApp.js";

export default function Home() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });
    const [allApps, setAllApps] = useImmer([]);

    const [open, setOpen] = useImmer(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        fetchAllApps();
        setOpen(false);
    };

    //table management stuffs
    const [page, setPage] = useImmer(0);
    const [order, setOrder] = useImmer("asc");
    const [orderBy, setOrderBy] = useImmer("app_acronym");
    const [filterInput, setFilterInput] = useImmer("");
    const [rowsPerPage, setRowsPerPage] = useImmer(5);
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

    const handleFilterByInput = (event) => {
        setPage(0);
        setFilterInput(event.target.value);
    };

    var dataFiltered = applyFilter({
        inputData: allApps,
        comparator: getComparator(order, orderBy),
        filterInput: filterInput,
        filterColumn: "app_acronym",
    });

    const notFound = !dataFiltered.length && !!filterInput;
    //end of table management stuffs

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
        fetchTokenValidity();
    }, []);

    //func to grab all apps Data
    async function fetchAllApps() {
        const response = await axiosPost("/app/getapps", {});

        if (response.success) {
            //success get apps
            setAllApps(response.message);
        } else {
            switch (response.errorCode) {
                case "ER_NOT_LOGIN": {
                    //unauthorized
                    appDispatch({ type: "logout" });
                    appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
                    break;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                    break;
                }
            }
        }
    }

    //run after getting fresh user state
    useEffect(() => {
        if (appState.loggedIn) {
            fetchAllApps();
        }
    }, [appState]);

    return (
        <>
            <Container sx={{ mt: 3 }}>
                <Card>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} mr={3}>
                        <UserTableToolbar filterName={filterInput} onFilterName={handleFilterByInput} />
                        {currentUserObj?.groupname?.includes("projectlead") && (
                            <Button onClick={handleOpen} variant="contained" color="inherit">
                                New App
                                <Add />
                            </Button>
                        )}
                    </Stack>

                    <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <>
                            <CreateApp />
                        </>
                    </Modal>

                    <TableContainer sx={{ overflow: "unset" }}>
                        <Table sx={{ minWidth: 800 }}>
                            <colgroup>
                                <col width="10%" />
                                <col width="12%" />
                                <col width="12%" />
                                <col width="11%" />
                                <col width="11%" />
                                <col width="11%" />
                                <col width="11%" />
                                <col width="11%" />
                                <col width="11%" />
                            </colgroup>
                            <UserTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={allApps.length}
                                onRequestSort={handleSort}
                                headLabel={[
                                    { id: "app_acronym", label: "App Name" },
                                    { id: "app_startdate", label: "Start-date" },
                                    { id: "app_enddate", label: "End-date" },
                                    { id: "app_permit_create", label: "create permit role" },
                                    { id: "app_permit_open", label: "permit open" },
                                    { id: "app_permit_todolist", label: "permit todo" },
                                    { id: "app_permit_doing", label: "permit doing" },
                                    { id: "app_permit_done", label: "permit done", align: "center" },
                                ]}
                            />
                            <TableBody>
                                {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <AppTableRow key={row.app_acronym} app_acronym={row.app_acronym} app_startdate={row.app_startdate} app_enddate={row.app_enddate} app_permit_create={row.app_permit_create} app_permit_open={row.app_permit_open} app_permit_todolist={row.app_permit_todolist} app_permit_doing={row.app_permit_doing} app_permit_done={row.app_permit_done} />
                                ))}
                                <TableEmptyRows height={77} emptyRows={emptyRows(page, rowsPerPage, allApps.length)} />

                                {notFound && <TableNoData query={filterInput} />}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination page={page} component="div" count={allApps.length} rowsPerPage={rowsPerPage} onPageChange={handleChangePage} rowsPerPageOptions={[5, 10, 25]} onRowsPerPageChange={handleChangeRowsPerPage} />
                </Card>
            </Container>
        </>
    );
}
