import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";

import { axiosPost } from "../axiosPost.js";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { Grid, Container, Paper, TextField, Button } from "@mui/material";

export default function Login() {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [userId, setUserId] = useImmer();
    const [password, setPassword] = useImmer();

    const [loginError, setLoginError] = useImmer(false);
    const abortController = new AbortController();

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await axiosPost("/login", { userId, password }, abortController);
        if (response.success) {
            //login
            appDispatch({ type: "login", user: response.user });
            appDispatch({ type: "flashMessage", success: true, message: "logged in sucessfully" });
        } else {
            switch (response.errorCode) {
                case "ER_INVALID_CREDEN": {
                    appDispatch({ type: "flashMessage", success: false, message: "Invalid Credentials" });
                    setLoginError(true);
                    setTimeout(() => {
                        setLoginError(false);
                    }, 2000);
                    return;
                }
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    navigate("/");
                    return;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                }
            }
        }
    }

    return (
        <>
            <Container>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Grid container justifyContent="center">
                            <h2>
                                <strong> Welcome to TMS </strong>
                            </h2>
                        </Grid>

                        <Paper elevation={20} style={{ padding: "20px" }}>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <TextField error={loginError} onChange={(e) => setUserId(e.target.value)} type="text" label="Username" variant="outlined" required autoComplete="off" placeholder="Enter Username" sx={{ mb: 2 }} fullWidth />
                                </div>
                                <div>
                                    <TextField error={loginError} helperText={loginError ? "Invalid Credentials" : " "} onChange={(e) => setPassword(e.target.value)} type="password" label="Password" variant="outlined" required autoComplete="off" placeholder="Enter Password" sx={{ mb: 1 }} fullWidth />
                                </div>
                                <Button variant="outlined" type="submit" color={loginError ? "error" : "primary"} fullWidth>
                                    Login
                                </Button>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
