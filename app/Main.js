//import router essentials
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

//import modules immer,toastify,axios etcs
import { useImmerReducer } from "use-immer";
import { useImmer } from "use-immer";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import { axiosPost } from "./axiosPost.js";
import Axios from "axios";

//set api url
Axios.defaults.baseURL = "http://localhost:3000/api/v1";

//import state dispatch context
import StateContext from "./StateContext.js";
import DispatchContext from "./DispatchContext.js";

//import My Components
import Header from "./components/Header.js";
import Home from "./components/Home.js";
import Login from "./components/login.js";
import NotFound from "./components/NotFound.js";
import Usermanagement from "./components/Usermanagement.js";
import Profile from "./components/Profile.js";
import Loading from "./components/Loading.js";
import RedirectHandler from "./components/RedirectHandler.js";

function Main() {
    //init empty user state
    const initialState = {
        loggedIn: undefined,
        user: { username: "" },
    };

    //show toast func
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

    //reducer func / dispatch
    function ourReducer(draft, action) {
        switch (action.type) {
            case "login":
                draft.loggedIn = true;
                draft.user.username = action.user.username;
                if (action.user.token) {
                    //set auth token in header
                    Axios.defaults.headers.common["Authorization"] = "Bearer " + action.user.token;
                    //set cookies
                    Cookies.set("token", action.user.token, { expires: 7 });
                }
                return;
            case "logout":
                //set logout, clear user data remove auth header remove cookies
                draft.loggedIn = false;
                draft.user = initialState.user;
                delete Axios.defaults.headers.common["Authorization"];
                Cookies.remove("token");
                return;
            case "flashMessage":
                showToastMessage(action.success, action.message);
                return;
        }
    }
    const [state, dispatch] = useImmerReducer(ourReducer, initialState);

    // Check if token has expired or not on first render
    useEffect(() => {
        async function fetchTokenValidity() {
            const token = Cookies.get("token");
            if (token) {
                Axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                const response = await axiosPost("/checktoken", {});
                if (response.success) {
                    //login
                    dispatch({ type: "login", user: response.user });
                } else {
                    switch (response.errorCode) {
                        //invalid jwt so force logout
                        case "ER_JWT_INVALID": {
                            dispatch({ type: "logout" });
                            dispatch({ type: "flashMessage", success: false, message: "Invalid JWT token, please login again!" });
                            break;
                        }
                        case "ER_NOT_LOGIN": {
                            dispatch({ type: "logout" });
                            dispatch({ type: "flashMessage", success: false, message: "Please Login to access!" });
                            break;
                        }
                        default: {
                            console.log("uncaught error");
                            dispatch({ type: "flashMessage", success: false, message: response.message });
                        }
                    }
                }
            } else {
                dispatch({ type: "logout" });
            }
        }
        fetchTokenValidity();
    }, []);

    useEffect(() => {
        console.log("state is");
        console.log(state);
    }, [state]);

    return (
        <>
            <StateContext.Provider value={state}>
                <DispatchContext.Provider value={dispatch}>
                    <BrowserRouter>
                        {state.loggedIn == undefined ? (
                            <Loading />
                        ) : (
                            <RedirectHandler>
                                {/* {state.loggedIn ? <Header /> : <></>} */}
                                <Header />
                                <Routes>
                                    <Route path="/" element={state.loggedIn ? <Home /> : <Login />} />
                                    <Route path="usermanagement" element={state.loggedIn ? <Usermanagement /> : <></>} />
                                    <Route path="myprofile" element={state.loggedIn ? <Profile /> : <></>} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </RedirectHandler>
                        )}
                    </BrowserRouter>
                </DispatchContext.Provider>
            </StateContext.Provider>
            <ToastContainer />
        </>
    );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);
