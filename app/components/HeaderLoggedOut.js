import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import DispatchContext from "../DispatchContext.js";

function HeaderLoggedOut(props) {
    const appDispatch = useContext(DispatchContext);
    const [userId, setUserId] = useState();
    const [password, setPassword] = useState();

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
        <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
            <div className="row align-items-center">
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={(e) => setUserId(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
                </div>
                <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
                    <input onChange={(e) => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
                </div>
                <div className="col-md-auto">
                    <button className="btn btn-success btn-sm">Sign In</button>
                </div>
            </div>
        </form>
    );
}

export default HeaderLoggedOut;
