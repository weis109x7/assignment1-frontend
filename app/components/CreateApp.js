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

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

export default function CreateApp(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    const [groupNameOptions, setGroupNameOptions] = useImmer([]);

    const [newAppObj, setNewAppObj] = useImmer({
        app_acronym: "",
        app_description: "",
        app_rnumber: "0",
        app_startdate: undefined,
        app_enddate: undefined,
        app_permit_create: "",
        app_permit_open: "",
        app_permit_todolist: "",
        app_permit_doing: "",
        app_permit_done: "",
    });

    const handleNewAppInput = (e) => {
        console.log(newAppObj);
        const { name, value } = e.target;
        setNewAppObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleEditAppValueNameInput = (value, name) => {
        setNewAppObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    async function handleSubmitnewApp(e) {
        e.preventDefault();

        //convert date to unix
        const submitAppObj = { ...newAppObj, app_startdate: dayjs(newAppObj.app_startdate).unix(), app_enddate: dayjs(newAppObj.app_enddate).unix() };

        const response = await axiosPost("/app/new", { ...submitAppObj });
        if (response.success) {
            //sucess added new app
            appDispatch({ type: "flashMessage", success: true, message: "App has been added!" });
            props.handleClose();
        } else {
            switch (response.errorCode) {
                //invalid field so flash message showing error
                case "ER_FIELD_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                    break;
                }
                //appname alrdy exist
                case "ER_DUP_ENTRY": {
                    appDispatch({ type: "flashMessage", success: false, message: "App Name already exists" });
                    break;
                }
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
                    break;
                }
            }
        }
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
        //func to grab groupNames
        async function fetchGroupNames() {
            const response = await axiosPost("/group/getGroups", {});
            if (response.success) {
                //success get groups
                let nameArr = response.message.map((a) => a.groupname);
                setGroupNameOptions(nameArr);
            } else {
                switch (response.errorCode) {
                    case "ER_NOT_LOGIN": {
                        //unauthorized
                        appDispatch({ type: "logout" });
                        // appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
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
        fetchTokenValidity();
        fetchGroupNames();
    }, []);

    return (
        <>
            <form onSubmit={handleSubmitnewApp}>
                <Grid
                    container
                    spacing={1}
                    justifyContent="space-evenly"
                >
                    <Grid
                        item
                        xs={6}
                    >
                        <Grid
                            container
                            spacing={1}
                            justifyContent="space-evenly"
                        >
                            <h2>Create Application</h2>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    size="small"
                                    name="app_acronym"
                                    onChange={(e) => handleNewAppInput(e)}
                                    value={newAppObj.app_acronym}
                                    fullWidth
                                    label="App Name"
                                    variant="outlined"
                                    required
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    size="small"
                                    name="app_description"
                                    onChange={(e) => handleNewAppInput(e)}
                                    value={newAppObj.app_description}
                                    fullWidth
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    minRows={3}
                                    maxRows={3}
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    name="app_rnumber"
                                    onChange={(e) => handleNewAppInput(e)}
                                    value={newAppObj.app_rnumber}
                                    size="small"
                                    fullWidth
                                    label="R number"
                                    variant="outlined"
                                    type="number"
                                    InputProps={{ inputProps: { min: 0, max: 100000 } }}
                                    required
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start-date"
                                        name="app_startdate"
                                        onChange={(e) => handleEditAppValueNameInput(e, "app_startdate")}
                                        slotProps={{ textField: { fullWidth: true, size: "small", required: true, value: newAppObj.app_startdate } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End-date"
                                        name="app_enddate"
                                        onChange={(e) => handleEditAppValueNameInput(e, "app_enddate")}
                                        slotProps={{ textField: { fullWidth: true, size: "small", required: true, value: newAppObj.app_enddate } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        item
                        xs={6}
                    >
                        <Grid
                            container
                            spacing={1}
                            justifyContent="space-evenly"
                        >
                            <h2>app permissions</h2>
                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={groupNameOptions}
                                    variant="outlined"
                                    value={newAppObj.app_permit_create}
                                    onChange={(event, newValue) => {
                                        handleEditAppValueNameInput(newValue, "app_permit_create");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Permit create"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={groupNameOptions}
                                    variant="outlined"
                                    value={newAppObj.app_permit_open}
                                    onChange={(event, newValue) => {
                                        handleEditAppValueNameInput(newValue, "app_permit_open");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Permit open"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={groupNameOptions}
                                    variant="outlined"
                                    value={newAppObj.app_permit_todolist}
                                    onChange={(event, newValue) => {
                                        handleEditAppValueNameInput(newValue, "app_permit_todolist");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Permit todo"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={groupNameOptions}
                                    variant="outlined"
                                    value={newAppObj.app_permit_doing}
                                    onChange={(event, newValue) => {
                                        handleEditAppValueNameInput(newValue, "app_permit_doing");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Permit doing"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={groupNameOptions}
                                    variant="outlined"
                                    value={newAppObj.app_permit_done}
                                    onChange={(event, newValue) => {
                                        handleEditAppValueNameInput(newValue, "app_permit_done");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Permit done"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        justify="center"
                    >
                        <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={5}
                        >
                            <Button
                                variant="contained"
                                onClick={props.handleClose}
                            >
                                Back to Apps
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                            >
                                New App
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
}
