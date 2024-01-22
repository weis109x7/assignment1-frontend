import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { useImmer } from "use-immer";

import { axiosPost } from "../axiosPost.js";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField, Typography } from "@mui/material";
import { Check, Add } from "@mui/icons-material";
import Modal from "@mui/material/Modal";

import TableNoData from "./user/table-no-data.jsx";
import UserTableRow from "./user/user-table-row.jsx";
import UserTableHead from "./user/user-table-head.jsx";
import TableEmptyRows from "./user/table-empty-rows.jsx";
import UserTableToolbar from "./user/user-table-toolbar.jsx";
import { emptyRows, applyFilter, getComparator } from "./user/utils";
import CreateTask from "./CreateTask.js";
import ViewPlans from "./ViewPlans.js";
import TaskCard from "./TaskCard.js";
import ViewTask from "./ViewTask.js";

import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";

import dayjs from "dayjs";

// ----------------------------------------------------------------------
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    overflowY: "scroll",
    transform: "translate(-50%, -50%)",
    height: "80%",
    width: "70%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

export default function Kanban() {
    const navigate = useNavigate();

    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [viewingTask, setViewingTask] = useImmer(null);

    const { appName } = useParams();

    const [allPlans, setAllPlans] = useImmer([]);
    const [selectedPlan, setSelectedPlan] = useImmer(null);
    //fetch task if selected plan is changed
    useEffect(() => {
        fetchTasks();
    }, [selectedPlan]);

    const [allTasks, setAllTasks] = useImmer([]);
    const [seperatedTasks, setSeperatedTasks] = useImmer({
        open: [],
        todo: [],
        doing: [],
        done: [],
        closed: [],
    });

    const taskSeperator = (acc, input) => {
        acc[input.task_status].push(input);
        return acc;
    };

    //run when alltasks is updated
    useEffect(() => {
        if (allTasks) {
            setSeperatedTasks(
                allTasks.reduce(taskSeperator, {
                    open: [],
                    todo: [],
                    doing: [],
                    done: [],
                    closed: [],
                })
            );
        }
    }, [allTasks]);

    const [newTaskPerm, setNewTaskPerm] = useImmer(false);

    const [openPlans, setOpenPlans] = useImmer(false);
    const [openAddTask, setOpenAddTask] = useImmer(false);
    const [openTask, setOpenTask] = useImmer(false);

    const handleClose = () => {
        fetchTasks();
        setOpenPlans(false);
        setOpenAddTask(false);
        setOpenTask(false);
        setViewingTask(null);
    };

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    //run after usr has resumed session or is already logged in
    useEffect(() => {
        if (currentUserObj?.groupname) {
            //get current all task for this app
            fetchTasks();
        }
    }, [currentUserObj]);

    //func to get taks for this app
    async function fetchTasks() {
        const response = await axiosPost("/task/gettasks", { task_app_acronym: appName });
        if (response.success) {
            if (selectedPlan) {
                let filteredTask = response.message.filter((task) => {
                    return task.task_plan == selectedPlan.plan_mvp_name;
                });
                setAllTasks(filteredTask);
            } else setAllTasks(response.message);
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
        async function fetchAppPerms() {
            const response = await axiosPost("/checkappperms", { appName: appName, perms_state: "create" });
            setNewTaskPerm(response.success);
            if (!response.success) {
                switch (response.errorCode) {
                    case "ER_NOT_ALLOWED": {
                        setNewTaskPerm(false);
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
                    case "ER_FIELD_INVALID": {
                        navigate("/app");
                        appDispatch({ type: "flashMessage", success: false, message: "Invalid App name?!" });
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
            const response = await axiosPost("/plan/getplans", { app_acronym: appName });
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
        fetchTokenValidity();
        fetchAppPerms();
        fetchPlans();
    }, []);

    return (
        <>
            <Modal
                open={openPlans}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <ViewPlans
                        currentApp={appName}
                        handleClose={handleClose}
                    ></ViewPlans>
                </Box>
            </Modal>
            <Modal
                open={openAddTask}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <CreateTask
                        currentApp={appName}
                        handleClose={handleClose}
                    ></CreateTask>
                </Box>
            </Modal>
            <Modal
                open={openTask}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <ViewTask
                        currentApp={appName}
                        currentTaskId={viewingTask}
                        handleClose={handleClose}
                    ></ViewTask>
                </Box>
            </Modal>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                margin={3}
                spacing={1}
            >
                <h1>{appName}</h1>
                <Box sx={{ width: "25%" }}>
                    <Autocomplete
                        size="small"
                        options={allPlans}
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
                        value={selectedPlan}
                        onChange={(event, newValue) => {
                            setSelectedPlan(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Task Plan"
                            />
                        )}
                    />
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => setOpenPlans(true)}
                    >
                        Plans
                    </Button>
                    {newTaskPerm && (
                        <Button
                            variant="contained"
                            sx={{ ml: 1 }}
                            onClick={() => setOpenAddTask(true)}
                        >
                            Add Task
                        </Button>
                    )}
                </Box>
            </Stack>

            <Stack
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
                divider={
                    <Divider
                        orientation="vertical"
                        flexItem
                    />
                }
            >
                <Stack
                    width={"17%"}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>open task</div>
                    {seperatedTasks.open.map((row) => (
                        <TaskCard
                            key={row.task_id}
                            task_name={row.task_name}
                            task_id={row.task_id}
                            task_owner={row.task_owner}
                            task_plan={row.task_plan}
                            openModal={() => {
                                setViewingTask(row.task_id);
                                setOpenTask(true);
                            }}
                        ></TaskCard>
                    ))}
                </Stack>
                <Stack
                    width={"17%"}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>todo task</div>
                    {seperatedTasks.todo.map((row) => (
                        <TaskCard
                            key={row.task_id}
                            task_name={row.task_name}
                            task_id={row.task_id}
                            task_owner={row.task_owner}
                            task_plan={row.task_plan}
                            openModal={() => {
                                setViewingTask(row.task_id);
                                setOpenTask(true);
                            }}
                        ></TaskCard>
                    ))}
                </Stack>
                <Stack
                    width={"17%"}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>doing task</div>
                    {seperatedTasks.doing.map((row) => (
                        <TaskCard
                            key={row.task_id}
                            task_name={row.task_name}
                            task_id={row.task_id}
                            task_owner={row.task_owner}
                            task_plan={row.task_plan}
                            openModal={() => {
                                setViewingTask(row.task_id);
                                setOpenTask(true);
                            }}
                        ></TaskCard>
                    ))}
                </Stack>
                <Stack
                    width={"17%"}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>done task</div>
                    {seperatedTasks.done.map((row) => (
                        <TaskCard
                            key={row.task_id}
                            task_name={row.task_name}
                            task_id={row.task_id}
                            task_owner={row.task_owner}
                            task_plan={row.task_plan}
                            openModal={() => {
                                setViewingTask(row.task_id);
                                setOpenTask(true);
                            }}
                        ></TaskCard>
                    ))}
                </Stack>
                <Stack
                    width={"17%"}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>closed task</div>
                    {seperatedTasks.closed.map((row) => (
                        <TaskCard
                            key={row.task_id}
                            task_name={row.task_name}
                            task_id={row.task_id}
                            task_owner={row.task_owner}
                            task_plan={row.task_plan}
                            openModal={() => {
                                setViewingTask(row.task_id);
                                setOpenTask(true);
                            }}
                        ></TaskCard>
                    ))}
                </Stack>
            </Stack>
        </>
    );
}
