import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

import { Grid, Container, Paper, TextField, Button } from "@mui/material";

function Login() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [userId, setUserId] = useImmer();
    const [password, setPassword] = useImmer();

    const [loginError, setLoginError] = useImmer(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await Axios.post("/login", { userId, password }).catch((error) => {
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
                appDispatch({ type: "login", data: response.data });
                appDispatch({ type: "flashMessage", value: "You have successfully logged in." });
            } else {
                console.log("Incorrect username / password.");
                setLoginError(true);
                setTimeout(() => {
                    setLoginError(false);
                }, 2000);
            }
        } catch (e) {
            console.log("front end error:");
            console.log(e);
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
                                    <TextField error={loginError} onChange={(e) => setUserId(e.target.value)} type="text" label="Username" variant="outlined" required autoComplete="off" placeholder="Enter Username" sx={{ mb: 2 }} />
                                </div>
                                <div>
                                    <TextField error={loginError} helperText={loginError ? "Invalid Credentials" : " "} onChange={(e) => setPassword(e.target.value)} type="password" label="Password" variant="outlined" required autoComplete="off" placeholder="Enter Password" sx={{ mb: 1 }} />
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

export default Login;
