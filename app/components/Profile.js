import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

import Stack from "@mui/material/Stack";

import { Grid, Container, Paper, TextField, Button } from "@mui/material";

export default function Profile() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [email, setEmail] = useImmer(appState.user.email);
    const [password, setPassword] = useImmer();

    const [loginError, setLoginError] = useImmer(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await Axios.post("/user/update", { email, password }).catch((error) => {
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
                appDispatch({ type: "flashMessage", success: true, message: "update profile success." });
                appDispatch({ type: "updateEmail", data: email });
            } else {
                appDispatch({ type: "flashMessage", success: false, message: response.errMessage });
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
                                <strong>Welcome to profile edit page</strong>
                            </h2>
                        </Grid>

                        <Paper elevation={20} style={{ padding: "20px" }}>
                            <form onSubmit={handleSubmit}>
                                <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <TextField value={email} onChange={(e) => setEmail(e.target.value)} type="text" label="E-mail" variant="outlined" autoComplete="off" placeholder="Enter Username" sx={{ mb: 2 }} fullWidth />

                                    <TextField onChange={(e) => setPassword(e.target.value)} type="password" label="New Password" variant="outlined" autoComplete="off" placeholder="Enter Password" fullWidth />

                                    <Stack direction="row" alignItems="center" justifyContent="space-evenly" spacing={1}>
                                        <Button variant="outlined" fullWidth>
                                            cancel
                                        </Button>
                                        <Button variant="outlined" type="submit" color={loginError ? "error" : "primary"} fullWidth>
                                            Save
                                        </Button>
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
