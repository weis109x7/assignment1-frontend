//react essentials
import React, { useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

//appstate and dispatch
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function HeaderLoggedIn(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);
    let location = useLocation();

    function handleLogout() {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", success: true, message: "You have successfully logged out." });
    }

    // Create a custom theme with overrides for disabled button styles
    const theme = createTheme({
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        "&.Mui-disabled": {
                            backgroundColor: "", // Set your custom background color for disabled state
                            color: "white", // Set your custom text color for disabled state
                        },
                    },
                },
            },
        },
    });

    return (
        <div>
            <ThemeProvider theme={theme}>
                {/* show button only if user group contains admin */}
                {appState.user.userGroup.split(",").includes("admin") ? (
                    // if user is on page then change color and disable button
                    <Button component={RouterLink} to="/usermanagement" variant="contained" disabled={location.pathname !== "/usermanagement" ? false : true}>
                        User Management
                    </Button>
                ) : (
                    <></>
                )}
                <Button component={RouterLink} to="/myprofile" variant="contained" disabled={location.pathname !== "/myprofile" ? false : true} sx={{ ml: 1 }}>
                    My Profile
                </Button>
            </ThemeProvider>
            <Button variant="contained" onClick={handleLogout} color="error" sx={{ ml: 1 }}>
                Sign Out
            </Button>
        </div>
    );
}
