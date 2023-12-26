import React, { useContext } from "react";
import { Link } from "react-router-dom";
import HeaderLoggedIn from "./HeaderLoggedIn.js";
import StateContext from "../StateContext.js";

import { AppBar, Toolbar, Box } from "@mui/material";

const pages = ["Products", "Pricing", "Blog"];

function Header(props) {
    const appState = useContext(StateContext);

    return (
        <AppBar position="static" sx={{ background: "#49A3BA" }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <h1>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <Box sx={{ color: "text.primary", "&:hover": { color: "text.secondary" } }}>TMS</Box>
                    </Link>
                </h1>
                {appState.loggedIn ? <HeaderLoggedIn /> : <></>}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
