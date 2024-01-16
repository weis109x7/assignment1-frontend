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

export default function ViewApp(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    const [groupNameOptions, setGroupNameOptions] = useImmer([]);

    const [editable, setEditable] = useImmer(false);

    //handle when edit is clicked, set fields to editable
    const handleEdit = (event) => {
        if (editable) {
            console.log("setfields to editable");
        }
        setEditable((editable) => !editable);
    };

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

    const handleNewAppDateInput = (value, name) => {
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

    useEffect(() => {
        if (editable) {
            fetchGroupNames();
        }
    }, [editable]);

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
            <form onSubmit={handleSubmitnewApp}>
                <Grid container spacing={1} justifyContent="space-evenly">
                    <Grid item xs={6}>
                        <Grid container spacing={1} justifyContent="space-evenly">
                            <h2>Viewing {props.viewingApp}</h2>
                            <Grid item xs={12}>
                                <TextField size="small" disabled name="app_acronym" onChange={(e) => handleNewAppInput(e)} value={newAppObj.app_acronym} fullWidth label="App Name" variant="outlined" required autoComplete="off" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField size="small" disabled={!editable} name="app_description" onChange={(e) => handleNewAppInput(e)} value={newAppObj.app_description} fullWidth label="Description" variant="outlined" multiline minRows={3} maxRows={3} autoComplete="off" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="app_rnumber" disabled onChange={(e) => handleNewAppInput(e)} value={newAppObj.app_rnumber} size="small" fullWidth label="R number" variant="outlined" type="number" InputProps={{ inputProps: { min: 0, max: 100000 } }} required />
                            </Grid>
                            <Grid item xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker label="Start-date" name="app_startdate" disabled={!editable} onChange={(e) => handleNewAppDateInput(e, "app_startdate")} slotProps={{ textField: { fullWidth: true, size: "small", required: true, value: newAppObj.app_startdate } }} />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker label="End-date" name="app_enddate" disabled={!editable} onChange={(e) => handleNewAppDateInput(e, "app_enddate")} slotProps={{ textField: { fullWidth: true, size: "small", required: true, value: newAppObj.app_enddate } }} />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={6}>
                        <Grid container spacing={1} justifyContent="space-evenly">
                            <h2>{props.viewingApp} permissions</h2>
                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="Permit create" disabled={!editable} variant="outlined" select required value={newAppObj.app_permit_create} name="app_permit_create" onChange={(e) => handleNewAppInput(e)}>
                                    {groupNameOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="Permit open" disabled={!editable} variant="outlined" select required value={newAppObj.app_permit_open} name="app_permit_open" onChange={(e) => handleNewAppInput(e)}>
                                    {groupNameOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="Permit todo" disabled={!editable} variant="outlined" select required value={newAppObj.app_permit_todolist} name="app_permit_todolist" onChange={(e) => handleNewAppInput(e)}>
                                    {groupNameOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="Permit doing" disabled={!editable} variant="outlined" select required value={newAppObj.app_permit_doing} name="app_permit_doing" onChange={(e) => handleNewAppInput(e)}>
                                    {groupNameOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="Permit done" disabled={!editable} variant="outlined" select required value={newAppObj.app_permit_done} name="app_permit_done" onChange={(e) => handleNewAppInput(e)}>
                                    {groupNameOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} justify="center">
                        <Stack direction="row" justifyContent="center" spacing={5}>
                            <Button variant="contained" onClick={props.handleClose}>
                                Back to Apps
                            </Button>

                            {currentUserObj?.groupname?.includes("projectlead") &&
                                (editable ? (
                                    <>
                                        <Button variant="outlined" onClick={handleEdit}>
                                            cancel
                                        </Button>
                                        <Button variant="outlined" type="submit">
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outlined" onClick={handleEdit}>
                                        edit
                                    </Button>
                                ))}
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
}
