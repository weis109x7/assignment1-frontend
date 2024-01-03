//import router essentials
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//import modules immer,toastify,axios etcs
import { useImmerReducer } from "use-immer";
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

function Main() {
    //init empty user state
    const initialState = {
        loggedIn: false,
        user: {
            email: "",
            isActive: "",
            userGroup: "",
            userId: "",
            token: "",
        },
        groupNames: [],
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

    //reducer func
    function ourReducer(draft, action) {
        switch (action.type) {
            case "login":
                draft.loggedIn = true;
                draft.user = action.user;
                //if email is null set to empty string to avoid errors
                draft.user.email = draft.user.email || "";
                //set auth token in header
                Axios.defaults.headers.common["Authorization"] = "Bearer " + action.user.token;
                //set cookies
                Cookies.set("token", action.user.token, { expires: 7 });
                return;
            case "logout":
                //set logout, clear user data remove auth header remove cookies
                draft.loggedIn = false;
                draft.user = initialState.user;
                draft.groupNames = initialState.groupNames;
                delete Axios.defaults.headers.common["Authorization"];
                Cookies.remove("token");
                return;
            case "flashMessage":
                showToastMessage(action.success, action.message);
                return;
            case "setGroupNames":
                draft.groupNames = action.data;
                return;
            case "updateUser":
                draft.user = { ...draft.user, ...action.user };
                return;
            case "forceLogout": {
                draft.loggedIn = undefined;
                return;
            }
        }
    }
    const [state, dispatch] = useImmerReducer(ourReducer, initialState);

    // Check if token has expired or not on first render
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            Axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            async function fetchTokenVaidity() {
                const response = await axiosPost("/checktoken", {});
                if (response.success) {
                    //login
                    dispatch({ type: "login", user: response.user });
                    dispatch({ type: "flashMessage", success: true, message: "Session Resumed" });
                } else {
                    switch (response.errorCode) {
                        //invalid jwt so force logout
                        case "ER_JWT_INVALID": {
                            //set login state to undefined so landing page can know to redirect
                            dispatch({ type: "forceLogout" });
                            dispatch({ type: "flashMessage", success: false, message: "Invalid JWT token, please login again!" });
                            break;
                        }
                        case "ER_NOT_LOGIN": {
                            dispatch({ type: "forceLogout" });
                            dispatch({ type: "flashMessage", success: false, message: "User has been disabled!" });
                            break;
                        }
                        default: {
                            console.log("uncaught error");
                            dispatch({ type: "flashMessage", success: false, message: response.message });
                        }
                    }
                }
            }
            fetchTokenVaidity();
        } else {
            //set login state to undefined so landing page can know to redirect
            dispatch({ type: "forceLogout" });
        }
    }, []);

    // useEffect(() => {
    //     console.log("current state is");
    //     console.log(state);
    // }, [state]);

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
