import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

import { Grid, Container, Paper, TextField, Button } from "@mui/material";

async function handleSubmit(e) {
    e.preventDefault();
    try {
        const response = await Axios.post("/user/new", { email, password }).catch((error) => {
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

function User(props) {
    return (
        <>
            <Grid container>
                <form onSubmit={handleSubmit}>
                    <Grid item alignItems="stretch" style={{ display: "flex" }}>
                        <TextField
                            InputProps={{
                                readOnly: true,
                            }}
                            defaultValue="Hello World4"
                            type="text"
                            label="E-mail"
                            variant="standard"
                            autoComplete="off"
                            placeholder="Enter Username"
                            sx={{ mr: 2 }}
                            size="small"
                        />
                        <TextField type="password" label="New Password" variant="outlined" autoComplete="off" placeholder="Enter Password" sx={{ mb: 1, mr: 2 }} size="small" />
                        <Button variant="outlined" type="submit" sx={{ height: "30px" }}>
                            Save
                        </Button>
                    </Grid>
                </form>
            </Grid>
        </>
    );
}

export default User;
