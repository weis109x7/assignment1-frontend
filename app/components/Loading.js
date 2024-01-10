import React, { useContext, useEffect } from "react";

//appstate and dispatch
import DispatchContext from "../DispatchContext.js";
import StateContext from "../StateContext.js";

export default function Loading() {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    return (
        <div className="text-center">
            <h1>Page is loading.</h1>
        </div>
    );
}
