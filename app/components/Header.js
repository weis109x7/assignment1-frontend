//import react essentials
import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

//import appstate
import StateContext from "../StateContext.js";

import { AppBar, Toolbar, Box } from "@mui/material";

//import my components
import HeaderLoggedIn from "./HeaderLoggedIn.js";

export default function Header(props) {
    const navigate = useNavigate();
    const appState = useContext(StateContext);

    //redirect to login page when user is loggedout
    useEffect(() => {
        if (appState.loggedIn == false) {
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
