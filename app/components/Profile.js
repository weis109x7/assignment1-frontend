import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

import { Grid, Container, Paper, TextField, Button } from "@mui/material";

function Profile() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [state, setState] = useImmer({
        isLoading: true,
        feed: [],
    });

    const [email, setEmail] = useImmer();
    const [password, setPassword] = useImmer();

    const [loginError, setLoginError] = useImmer(false);

    const regex = new RegExp(/^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{8,10}$/);

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
                // appDispatch({ type: "login", data: response.data });
                appDispatch({ type: "flashMessage", value: "update profile success." });
            } else {
                appDispatch({ type: "flashMessage", value: "error updating profile." });
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

    useEffect(() => {
        if (password) {
            setLoginError(!regex.test(password));
        } else {
            setLoginError(false);
        }
    }, [password]);

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
                                <div>
                                    <TextField onChange={(e) => setEmail(e.target.value)} type="text" label="E-mail" variant="outlined" autoComplete="off" placeholder="Enter Username" sx={{ mb: 2 }} fullWidth />
                                </div>
                                <div>
                                    <TextField error={loginError} helperText={loginError ? "password needs to be 8-10char and contains alphanumeric and specialcharacter" : " "} onChange={(e) => setPassword(e.target.value)} type="password" label="New Password" variant="outlined" autoComplete="off" placeholder="Enter Password" sx={{ mb: 1 }} fullWidth />
                                </div>
                                <Button variant="outlined" type="submit" color={loginError ? "error" : "primary"} fullWidth>
                                    Save
                                </Button>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

export default Profile;
