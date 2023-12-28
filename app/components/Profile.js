import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";
import { axiosPost } from "../axiosPost.js";

import Stack from "@mui/material/Stack";

import { useNavigate } from "react-router-dom";
import { Grid, Container, Paper, TextField, Button } from "@mui/material";

export default function Profile() {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);
    const [email, setEmail] = useImmer(appState.user.email);
    const [password, setPassword] = useImmer("");

    const [loginError, setLoginError] = useImmer(false);

    const abortController = new AbortController();

    const handleEdit = (event) => {
        if (editable) {
            setEmail(appState.user.email);
            setPassword("");
        }
        setEditable((editable) => !editable);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await axiosPost("/user/update", { email, password }, abortController);

        if (response.success) {
            appDispatch({ type: "flashMessage", success: true, message: "sucessfully updated own profile" });
            appDispatch({ type: "updateEmail", data: email });
            setEditable(false);
            setPassword("");
        } else {
            switch (response.errorCode) {
                case "ER_PW_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: "password needs to be 8-10char and contains alphanumeric and specialcharacter" });
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
            setLoginError(true);
            setTimeout(() => {
                setLoginError(false);
            }, 2000);
        }
    }

    useEffect(() => {
        setEmail(appState.user.email);
    }, [appState.user.email]);

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
