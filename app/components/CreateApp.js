import React, { useContext, useEffect } from "react";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { useImmer } from "use-immer";
import { axiosPost } from "../axiosPost.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Check, Add } from "@mui/icons-material";

import TableNoData from "./user/table-no-data.jsx";
import AppTableRow from "./user/app-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";

import { emptyRows, applyFilter, getComparator } from "./user/utils.js";
import { styled } from "@mui/material/styles";

export default function CreateApp(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

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

    return (
        <>
            <form>
                <Container sx={{ mt: 3 }}>
                    <Card elevation={20} style={{ padding: "20px" }}>
                        <Grid container spacing={2} justifyContent="space-evenly">
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="App Name" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Permit create" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Description" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Permit open" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="R number" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Permit todo" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Start-date" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Permit doing" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="End-date" variant="outlined" />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField fullWidth id="outlined-basic" label="Permit done" variant="outlined" />
                            </Grid>

                            <Grid item xs={12} justify="center">
                                <Stack direction="row" justifyContent="center" spacing={5}>
                                    {true ? (
                                        <>
                                            <Button variant="contained">Save</Button>
                                            <Button variant="contained">Cancel</Button>
                                        </>
                                    ) : (
                                        <Button>edit</Button>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Card>
                </Container>
            </form>
        </>
    );
}
