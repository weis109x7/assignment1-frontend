import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useImmerReducer } from "use-immer";
import Cookies from "js-cookie";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:3000/api/v1";

import { ToastContainer, toast } from "react-toastify";

import StateContext from "./StateContext.js";
import DispatchContext from "./DispatchContext.js";

// My Components
import Header from "./components/Header.js";
import Home from "./components/Home.js";
import Login from "./components/login.js";
import NotFound from "./components/NotFound.js";
import Usermanagement from "./components/Usermanagement.js";
import Profile from "./components/Profile.js";

function Main() {
    const initialState = {
        loggedIn: false,
        user: {
            token: Cookies.get("token"),
        },
        groupNames: [],
    };

    const showToastMessage = (success, message) => {
        if (success) {
            toast.success(message, {
                position: toast.POSITION.TOP_LEFT,
            });
        } else {
            toast.error(message, {
                position: toast.POSITION.TOP_LEFT,
            });
        }
    };

    function ourReducer(draft, action) {
        switch (action.type) {
            case "login":
                draft.loggedIn = true;
                draft.user = action.data.user;
                Axios.defaults.headers.common["Authorization"] = "Bearer " + action.data.user.token;
                Cookies.set("token", action.data.user.token, { expires: 7 });
                return;
            case "logout":
                draft.loggedIn = false;
                delete draft.user;
                delete Axios.defaults.headers.common["Authorization"];
                Cookies.remove("token");
                return;
            case "flashMessage":
                showToastMessage(action.success, action.message);
                return;
            case "setGroupNames":
                draft.groupNames = action.data;
                return;
            case "updateEmail":
                draft.user.email = action.data;
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(ourReducer, initialState);

    const controller = new AbortController();
    // Check if token has expired or not on first render
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            Axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            async function fetchResults() {
                try {
                    const response = await Axios.post("/checktoken", { signal: controller.signal }).catch((error) => {
                        // return backend error
                        if (error.response) {
                            console.log("backend error");
                            return error.response.data;
                        } else {
                            console.log("axios error");
                            throw error;
                        }
                    });
                    console.log("check token response following:");
                    console.log(response);
                    if (response.data) {
                        //login
                        dispatch({ type: "login", data: response.data });
                        dispatch({ type: "flashMessage", success: true, message: "Your session has resumed." });
                    } else {
                        //logout
                        dispatch({ type: "logout" });
                        dispatch({ type: "flashMessage", success: false, message: "Your session has expired. Please log in again." });
                    }
                } catch (e) {
                    console.log("front end error:");
                    console.log(e);
                }
            }
            fetchResults();
            return () => controller.abort();
        }
    }, []);

    return (
        <>
            <StateContext.Provider value={state}>
                <DispatchContext.Provider value={dispatch}>
                    <BrowserRouter>
                        <Header />
                        <Routes>
                            <Route path="/" element={state.loggedIn ? <Home /> : <Login />} />
                            <Route path="usermanagement" element={<Usermanagement />} />
                            <Route path="myprofile" element={<Profile />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </DispatchContext.Provider>
            </StateContext.Provider>
            <ToastContainer />
        </>
    );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);
