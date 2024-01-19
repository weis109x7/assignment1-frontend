import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useImmer } from "use-immer";

import { axiosPost } from "../axiosPost.js";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField, Typography } from "@mui/material";
import { Check, Add } from "@mui/icons-material";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";

import TableNoData from "./user/table-no-data.jsx";
import PlanTableRow from "./user/plan-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";
import { emptyRows, applyFilter, getComparator } from "./user/utils";
import Divider from "@mui/material/Divider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

// ----------------------------------------------------------------------

export default function ViewTask({ currentTaskId, handleClose, currentApp }) {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editTaskPerm, setEditTaskPerm] = useImmer(false);
    const [promotable, setPromotable] = useImmer(false);
    const [saveable, setSaveable] = useImmer(true);
    const [demotable, setDemotable] = useImmer(false);
    const [planEditable, setPlanEditable] = useImmer(false);

    const [allPlans, setAllPlans] = useImmer([]);

    const [editable, setEditable] = useImmer(false);
    const toggleEdit = (event) => {
        setEditable((editable) => !editable);
        fetchTaskByID();
        fetchPlans();
    };

    const [newTaskObj, setNewTaskObj] = useImmer({
        task_name: "",
        task_id: "",
        task_description: "",
        task_status: "",
        task_creator: "",
        task_owner: "",
        task_createdate: "",
        task_notes: "",
        task_plan: null,
        task_app_acronym: "",
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

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    const [currentTaskObj, setCurrentTaskObj] = useImmer({
        task_name: "",
        task_id: "",
        task_description: "",
        task_status: "",
        task_creator: "",
        task_owner: "",
        task_createdate: "",
        task_notes: "",
        task_plan: null,
        task_app_acronym: "",
    });

    async function handleSubmit(e) {
        let action = e.target.name;
        e.preventDefault();

        const response = await axiosPost("/task/edit", {
            task_id: newTaskObj.task_id,
            task_description: newTaskObj.task_description,
            task_status: newTaskObj.task_status,
            task_notes: newTaskObj.task_notes,
            task_plan: newTaskObj?.task_plan?.plan_mvp_name ?? "",
            action: action,
        });

        if (response.success) {
            //success new plan
            appDispatch({ type: "flashMessage", success: true, message: "sucessfully edited task" });
            setEditable(false);
            fetchTaskByID();
            fetchPlans();
        } else {
            switch (response.errorCode) {
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
                    break;
                }
                case "ER_REFRESH": {
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                    break;
                }
                case "ER_FIELD_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
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

    // fetch app perms when task is loaded and set newtaskobj
    useEffect(() => {
        let taskPlan = allPlans.filter((plan) => plan.plan_mvp_name == currentTaskObj.task_plan)[0] ?? null;
        if (allPlans && currentTaskObj) setNewTaskObj({ ...currentTaskObj, task_plan: taskPlan, task_notes: "" });
        if (currentTaskObj.task_status == "doing" || currentTaskObj.task_status == "done") setDemotable(true);
        else setDemotable(false);
        if (currentTaskObj.task_status == "closed") setPromotable(false);
        else setPromotable(true);
        if (currentTaskObj.task_status == "open" || currentTaskObj.task_status == "done") setPlanEditable(true);
        else setPlanEditable(false);
    }, [currentTaskObj, allPlans]);

    // check for change in plans
    useEffect(() => {
        let compare1 = newTaskObj?.task_plan?.plan_mvp_name ?? "";
        let compare2 = currentTaskObj.task_plan ?? "";

        if (currentTaskObj.task_status == "done") {
            if (compare1 != compare2) {
                setPromotable(false);
                setSaveable(false);
            } else {
                setPromotable(true);
                setSaveable(true);
            }
        }
    }, [newTaskObj]);

    async function fetchPlans() {
        const response = await axiosPost("/plan/getplans", { app_acronym: currentApp });
        if (response.success) {
            setAllPlans(response.message);
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

    // fetch app perms when task is loaded
    useEffect(() => {
        async function fetchAppPerms() {
            const response = await axiosPost("/checkappperms", { appName: currentApp, perms_state: currentTaskObj.task_status });
            setEditTaskPerm(response.success);
        }
        if (currentTaskObj.task_status) fetchAppPerms();
    }, [currentTaskObj]);

    async function fetchTaskByID() {
        const response = await axiosPost("/task/gettaskbyid", { task_id: currentTaskId });
        if (response.success) {
            setCurrentTaskObj(response.message[0]);
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
        fetchTaskByID();
        fetchPlans();
    }, []);

    return (
        <>
            <form>
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
                            <Grid
                                item
                                xs={12}
                            >
                                <Stack
                                    direction="column"
                                    justifyContent="flex-start"
                                    alignItems="flex-start"
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                    >
                                        <Typography variant="h6">{currentTaskObj.task_name}</Typography>
                                        &nbsp;&nbsp;&nbsp;
                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                        />
                                        &nbsp;&nbsp;&nbsp;
                                        <Typography variant="overline">{currentTaskObj.task_status}</Typography>
                                        &nbsp;&nbsp;&nbsp;
                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                        />
                                        &nbsp;&nbsp;&nbsp;
                                        <Typography variant="body1"> #{currentTaskObj.task_id} </Typography>
                                    </Stack>
                                    <Typography variant="subtitle1">created by {currentTaskObj.task_creator}</Typography>
                                    <Typography variant="subtitle1">on {dayjs.unix(currentTaskObj.task_createdate).format("llll")}</Typography>
                                    <Typography variant="subtitle1">Owner: {currentTaskObj.task_owner}</Typography>
                                </Stack>
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
                                    minRows={3}
                                    maxRows={3}
                                    autoComplete="off"
                                    disabled={!editable}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <Autocomplete
                                    size="small"
                                    options={allPlans}
                                    getOptionLabel={(option) => option.plan_mvp_name}
                                    disabled={!(editable && planEditable)}
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
                                    // onChange={(e) => handleNewTaskInput(e)}
                                    placeholder="Enter Notes here"
                                    multiline
                                    rows={10}
                                    autoComplete="off"
                                    fullWidth
                                    variant="outlined"
                                    value={currentTaskObj.task_notes}
                                    inputProps={{ readOnly: true }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                    >
                        {editable && (
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
                                disabled={!editable}
                            />
                        )}
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

                            {editTaskPerm &&
                                (editable ? (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={toggleEdit}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            name="demote"
                                            disabled={!demotable}
                                        >
                                            Demote and save
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            name="edit"
                                            disabled={!saveable}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            name="promote"
                                            disabled={!promotable}
                                        >
                                            Promote and Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={toggleEdit}
                                    >
                                        Edit
                                    </Button>
                                ))}
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
}
