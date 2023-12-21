import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

function Login() {
    const appState = useContext(StateContext);
    const [userId, setUserId] = useImmer();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await Axios.post("/login", { userId, password }).catch((error) => {
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
                appDispatch({ type: "login", data: response.data });
                appDispatch({ type: "flashMessage", value: "You have successfully logged in." });
            } else {
                console.log("Incorrect username / password.");
                appDispatch({ type: "flashMessage", value: "Invalid username / password." });
            }
        } catch (e) {
            console.log("front end error:");
            console.log(e);
        }
    }

    return (
        <>
            <h2 className="text-center">
                <strong> Welcome to TMS </strong>
            </h2>
            <p className="lead text-muted text-center">this is the login page</p>
        </>
    );
}

export default Login;
