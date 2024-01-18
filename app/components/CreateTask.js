import React, { useContext, useEffect } from "react";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { useImmer } from "use-immer";
import { axiosPost } from "../axiosPost.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField, Typography } from "@mui/material";
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
import localizedFormat from "dayjs/plugin/localizedFormat";

export default function CreateTask({ handleClose, currentApp }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    dayjs.extend(localizedFormat);

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    const [plansObj, setPlansObj] = useImmer([]);

    const [newTaskObj, setNewTaskObj] = useImmer({
        task_name: "",
        task_description: "",
        task_notes: "",
        task_plan: null,
        task_app_acronym: currentApp,
    });

    const handleNewTaskInput = (e) => {
        const { name, value } = e.target;
        setNewTaskObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleNewTaskValueNameInput = (value, name) => {
        setNewTaskObj((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    async function handleSubmitnewTask(e) {
        e.preventDefault();

        const response = await axiosPost("/task/new", { ...newTaskObj, task_plan: newTaskObj.task_plan?.plan_mvp_name ?? "" });
        if (response.success) {
            //sucess added new task
            appDispatch({ type: "flashMessage", success: true, message: "Task has been added!" });
            handleClose();
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
            <form onSubmit={handleSubmitnewTask}>
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
                            <h2>Create New Task for {currentApp}</h2>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    size="small"
                                    name="task_name"
                                    onChange={(e) => handleNewTaskInput(e)}
                                    value={newTaskObj.task_name}
                                    fullWidth
                                    label="Task Name"
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
                                    name="task_description"
                                    onChange={(e) => handleNewTaskInput(e)}
                                    value={newTaskObj.task_description}
                                    fullWidth
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    minRows={6}
                                    maxRows={6}
                                    autoComplete="off"
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={plansObj}
                                    getOptionLabel={(option) => option.plan_mvp_name}
                                    renderOption={(props, option) => (
                                        <Box
                                            sx={{ mr: 2 }}
                                            {...props}
                                        >
                                            <Stack
                                                direction="column"
                                                justifyContent="center"
                                            >
                                                <Typography variant="body2">{option.plan_mvp_name}</Typography>
                                                <Typography variant="caption">
                                                    {dayjs.unix(option.plan_startdate).format("ll")} - {dayjs.unix(option.plan_enddate).format("ll")}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    )}
                                    variant="outlined"
                                    value={newTaskObj.task_plan}
                                    onChange={(event, newValue) => {
                                        handleNewTaskValueNameInput(newValue, "task_plan");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Task Plan"
                                        />
                                    )}
                                />
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
                            <h2>task notes</h2>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    size="small"
                                    name="task_notes"
                                    onChange={(e) => handleNewTaskInput(e)}
                                    placeholder="Enter Notes here"
                                    multiline
                                    rows={10}
                                    autoComplete="off"
                                    fullWidth
                                    variant="outlined"
                                    value={newTaskObj.task_notes}
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
                                onClick={handleClose}
                            >
                                Back to Kanban
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                            >
                                New Task
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
}
