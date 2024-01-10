import React, { useContext, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { axiosPost } from "../axiosPost.js";

//import state dispatch context
import StateContext from "../StateContext.js";
import DispatchContext from "../DispatchContext.js";

export default function RedirectHandler(props) {
    const appState = useContext(StateContext);
    const appDispatch = useContext(DispatchContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Check the state value and redirect if needed
        if (appState.loggedIn == false) {
            navigate("/"); // Redirect to the home page
        }
    }, [appState.loggedIn]);

    return props.children;
}
