import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { useImmerReducer } from "use-immer";
import Cookies from "js-cookie";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:3000/api/v1";

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
    };

    const [state, dispatch] = useImmerReducer(ourReducer, initialState);

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
                console.log(action.value);
                return;
        }
    }

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
                        dispatch({ type: "flashMessage", value: "Your session has resumed." });
                    } else {
                        //logout
                        dispatch({ type: "logout" });
                        dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." });
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
        </>
    );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);
