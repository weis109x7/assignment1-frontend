import React, { useEffect, useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

import { Button } from "@mui/material";

function HeaderLoggedIn(props) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);
    let location = useLocation();

    function handleLogout() {
        appDispatch({ type: "logout" });
        appDispatch({ type: "flashMessage", value: "You have successfully logged out." });
    }

    function test() {
        console.log(appState.user.userGroup);
    }

    return (
        <div>
            {appState.user.userGroup.split(",").includes("admin") ? (
                <Button
                    component={RouterLink}
                    to="/usermanagement"
                    variant="contained"
                    disabled={location.pathname !== "/usermanagement" ? false : true}
                    sx={{
                        "&.Mui-disabled": {
                            background: "info.main",
                            color: "primary.main",
                        },
                    }}
                >
                    User Management
                </Button>
            ) : (
                <></>
            )}

            <Button component={RouterLink} to="/myprofile" variant="contained" sx={{ ml: 1 }}>
                My Profile
            </Button>
            <Button component={RouterLink} to="/" variant="contained" onClick={handleLogout} color="error" sx={{ ml: 1 }}>
                Sign Out
            </Button>
        </div>
    );
}

export default HeaderLoggedIn;
