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

// ----------------------------------------------------------------------

export default function Usermanagement() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [page, setPage] = useImmer(0);

    const [order, setOrder] = useImmer("asc");

    const [orderBy, setOrderBy] = useImmer("name");

    const [filterName, setFilterName] = useImmer("");

    const [rowsPerPage, setRowsPerPage] = useImmer(5);

    const [allUsers, setAlUsers] = useImmer([]);

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

    const notFound = !dataFiltered.length && !!filterName;

    const controller = new AbortController();
    useEffect(() => {
        async function fetchResults() {
            try {
                const response = await Axios.post("/user/getusers", { signal: controller.signal }).catch((error) => {
                    // return backend error
                    if (error.response) {
                        console.log("backend error");
                        return error.response.data;
                    } else {
                        console.log("axios error");
                        throw error;
                    }
                });
                console.log("response following:");
                console.log(response);
                if (response.data) {
                    setAlUsers(response.data.message);
                } else {
                    console.log("fail getting users");
                }
            } catch (e) {
                console.log("front end error:");
                console.log(e);
            }
        }
        if (appState.loggedIn) fetchResults();
        return () => controller.abort();
    }, [appState.loggedIn]);

    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Users</Typography>

                <Button variant="contained" color="inherit" startIcon={<></>}>
                    New User
                </Button>
            </Stack>

            <Card>
                <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} />
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
                                <UserTableRow key={row.userId} password={"********"} userId={row.userId} email={row.email} userGroup={row.userGroup} status={row.isActive} />
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
