//react essentials
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";

import { useImmer } from "use-immer";
import { axiosPost } from "../axiosPost.js";

import { Stack, Grid, Container, Paper, TextField, Button } from "@mui/material";

export default function Profile() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);
    const [email, setEmail] = useImmer("");
    const [password, setPassword] = useImmer("");

    const [loginError, setLoginError] = useImmer(false);

    //handle when edit is clicked, set fields to editable
    const handleEdit = (event) => {
        if (editable) {
            setEmail(currentUserObj.email);
            setPassword("");
        }
        setEditable((editable) => !editable);
    };

    //handle when save is clicked
    async function handleSaveSubmit(e) {
        e.preventDefault();
        const response = await axiosPost("/user/update", { email, password });

        //if success, update appstate with new email and flash message
        if (response.success) {
            appDispatch({ type: "flashMessage", success: true, message: "sucessfully updated own profile" });
            setEditable(false);
            setPassword("");
        } else {
            switch (response.errorCode) {
                case "ER_PW_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: "password needs to be 8-10char and contains alphanumeric and specialcharacter" });
                    setLoginError(true);
                    setTimeout(() => {
                        setLoginError(false);
                    }, 2000);
                    break;
                }
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
                    break;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }

    const [currentUserObj, setCurrentUserObj] = useImmer({
        email: "",
    });

    // fetch latest user data
    useEffect(() => {
        async function fetchTokenValidity() {
            const response = await axiosPost("/checktoken", {});
            if (response.success) {
                //login
                appDispatch({ type: "login", user: response.user });
                setCurrentUserObj({ email: response.user.email });
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
    }, [editable]);

    //run after usr has resumed session or is already logged in and ONLY if usr is admin
    useEffect(() => {
        if (currentUserObj.email) setEmail(currentUserObj.email);
    }, [currentUserObj]);

    return (
        <>
            <Container>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Grid container justifyContent="center">
                            <h2>
                                <strong>Welcome to profile edit page</strong>
                            </h2>
                        </Grid>

                        <Paper elevation={20} style={{ padding: "20px" }}>
                            <form onSubmit={handleSaveSubmit}>
                                <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <TextField value={email} disabled={!editable} onChange={(e) => setEmail(e.target.value)} type="text" label="E-mail" variant="outlined" autoComplete="off" placeholder="Enter Username" sx={{ mb: 2 }} fullWidth />

                                    <TextField value={password} disabled={!editable} onChange={(e) => setPassword(e.target.value)} type="password" label="New Password" variant="outlined" autoComplete="off" placeholder="Enter Password" fullWidth />

                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {editable ? (
                                            <>
                                                <Button variant="outlined" onClick={handleEdit} fullWidth>
                                                    cancel
                                                </Button>
                                                <Button variant="outlined" type="submit" color={loginError ? "error" : "primary"} fullWidth>
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outlined" onClick={handleEdit} fullWidth>
                                                edit
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
