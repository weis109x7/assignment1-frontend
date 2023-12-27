import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext.js";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link, Outlet } from "react-router-dom";

export default function Home() {
    const appState = useContext(StateContext);
    const [state, setState] = useImmer({
        isLoading: true,
        feed: [],
    });

    return (
        <>
            <h2 className="text-center">
                <strong> Welcome to TMS </strong>
            </h2>
            <p className="lead text-muted text-center">this is the home page</p>
            <Outlet />
        </>
    );
}
