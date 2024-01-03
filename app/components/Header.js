//import react essentials
import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { axiosPost } from "../axiosPost.js";
//import appstate
import StateContext from "../StateContext.js";

import Cookies from "js-cookie";
import DispatchContext from "../DispatchContext.js";

import { AppBar, Toolbar, Box } from "@mui/material";

//import my components
import HeaderLoggedIn from "./HeaderLoggedIn.js";

export default function Header(props) {
    const navigate = useNavigate();
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    // Check if token has expired or not on first render
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            Axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            async function fetchTokenVaidity() {
                const response = await axiosPost("/checktoken", {});
                if (response.success) {
                    //login
                    appDispatch({ type: "login", user: response.user });
                    appDispatch({ type: "flashMessage", success: true, message: "Session Resumed" });
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
                            appDispatch({ type: "flashMessage", success: false, message: "User has been disabled!" });
                            break;
                        }
                        default: {
                            console.log("uncaught error");
                            appDispatch({ type: "flashMessage", success: false, message: response.message });
                        }
                    }
                }
            }
            fetchTokenVaidity();
        } else {
            navigate("/");
        }
    }, []);

    //redirect to login page when user is loggedout
    useEffect(() => {
        if (!appState.loggedIn) {
            navigate("/");
        }
    }, [appState.loggedIn]);

    return (
        <AppBar position="static" sx={{ background: "#49A3BA" }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <h1>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <Box sx={{ color: "text.primary", "&:hover": { color: "text.secondary" } }}>TMS</Box>
                    </Link>
                </h1>

                {appState.loggedIn ? (
                    <>
                        {/* if logged in, show logged in header and buttons else show nothing */}
                        <h3>{appState.user.userId}</h3> <HeaderLoggedIn />
                    </>
                ) : (
                    <></>
                )}
            </Toolbar>
        </AppBar>
    );
}
