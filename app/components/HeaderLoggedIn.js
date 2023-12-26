import React, { useEffect, useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function HeaderLoggedIn(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);
    let location = useLocation();

    function handleLogout() {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", value: "You have successfully logged out." });
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
                {appState.user.userGroup.split(",").includes("admin") ? (
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
            <Button component={RouterLink} to="/" variant="contained" onClick={handleLogout} color="error" sx={{ ml: 1 }}>
                Sign Out
            </Button>
        </div>
    );
}

export default HeaderLoggedIn;
