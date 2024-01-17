import React, { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useImmer } from "use-immer";

import { axiosPost } from "../axiosPost.js";

import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { MenuItem, Card, Stack, Table, Button, Container, TableBody, TableContainer, TablePagination, Autocomplete, TextField } from "@mui/material";
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

import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";

// ----------------------------------------------------------------------
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

export default function Kanban() {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const { appName } = useParams();

    const [openPlans, setOpenPlans] = useImmer(false);
    const [openAddTask, setOpenAddTask] = useImmer(false);
    const [openTask, setOpenTask] = useImmer(false);

    const handleClose = () => {
        console.log("fetch app task");
        setOpenPlans(false);
        setOpenAddTask(false);
        setOpenTask(false);
    };

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    //run after usr has resumed session or is already logged in and ONLY if usr is admin
    useEffect(() => {
        if (currentUserObj?.groupname) {
            //get current all task for this app
            console.log("get app tasks");
        }
    }, [currentUserObj]);

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
                    {/* <ViewApp
                        viewingApp={viewingApp}
                        setViewingApp={setViewingApp}
                        handleClose={handleClose}
                    ></ViewApp> */}
                    view task
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
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => setOpenPlans(true)}
                    >
                        Plans
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ ml: 1 }}
                        onClick={() => setOpenAddTask(true)}
                    >
                        Add Task
                    </Button>
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
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>open task header</div>
                    <div>task 1</div>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>todo task header</div>
                    <div>task 1</div>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>doing task header</div>
                    <div>task 1</div>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>done task header</div>
                    <div>task 1</div>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <div>closed task header</div>
                    <div>task 1</div>
                </Stack>
            </Stack>
        </>
    );
}
