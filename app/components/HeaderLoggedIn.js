//react essentials
import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

//appstate and dispatch
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { axiosPost } from "../axiosPost.js";

import { useImmer } from "use-immer";

export default function HeaderLoggedIn(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);
    let location = useLocation();

    function handleLogout() {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", success: true, message: "You have successfully logged out." });
    }

    const [currentUserObj, setCurrentUserObj] = useImmer({
        groupname: undefined,
    });

    // fetch latest user data
    useEffect(() => {
        async function fetchTokenValidity() {
            const response = await axiosPost("/checktoken", {});
            if (response.success) {
                //login
                appDispatch({ type: "login", user: response.user });
                setCurrentUserObj({ groupname: response.user.groupname });
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
                        appDispatch({ type: "flashMessage", success: false, message: "Please Login to access!" });
                        break;
                    }
                    default: {
                        console.log("uncaught error");
                        appDispatch({ type: "flashMessage", success: false, message: response.message });
                    }
                }
            }
        }
        fetchTokenValidity();
    }, []);

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
                {currentUserObj?.groupname?.includes("admin") && (
                    // if user is on page then change color and disable button
                    <Button component={Link} to="/usermanagement" variant="contained" disabled={location.pathname !== "/usermanagement" ? false : true}>
                        User Management
                    </Button>
                )}
                <Button component={Link} to="/myprofile" variant="contained" disabled={location.pathname !== "/myprofile" ? false : true} sx={{ ml: 1 }}>
                    My Profile
                </Button>
            </ThemeProvider>
            <Button variant="contained" onClick={handleLogout} color="error" sx={{ ml: 1 }}>
                Sign Out
            </Button>
        </div>
    );
}
