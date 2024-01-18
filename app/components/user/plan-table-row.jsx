import React, { useContext, useEffect } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useImmer } from "use-immer";
import { axiosPost } from "../../axiosPost.js";
import StateContext from "../../StateContext.js";
import DispatchContext from "../../DispatchContext.js";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { TextField } from "@mui/material";

import { Autocomplete } from "@mui/material";
import { Check } from "@mui/icons-material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";

import dayjs from "dayjs";

// ----------------------------------------------------------------------

export default function PlanTableRow({ plan_mvp_name, plan_startdate, plan_enddate, editPlanPerm, currentApp, fetchPlans }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);

    const [startDate, setStartDate] = useImmer(dayjs.unix(plan_startdate));
    const [endDate, setEndDate] = useImmer(dayjs.unix(plan_enddate));

    // use latest data
    useEffect(() => {
        setStartDate(dayjs.unix(plan_startdate));
        setEndDate(dayjs.unix(plan_enddate));
    }, [plan_startdate, plan_enddate]);

    const handleEdit = (event) => {
        setEditable((editable) => !editable);
        //fetch fresh plans here
        fetchPlans();
    };

    const cancelEdit = (event) => {
        setEditable(false);
        fetchPlans();
        //reset to old value
        setStartDate(dayjs.unix(plan_startdate));
        setEndDate(dayjs.unix(plan_enddate));
    };

    async function handleEditSubmit(e) {
        e.preventDefault();

        //convert date to unix
        const submitPlanObj = {
            plan_mvp_name: plan_mvp_name,
            plan_startdate: dayjs(startDate).unix(),
            plan_enddate: dayjs(endDate).unix(),
            plan_app_acronym: currentApp,
        };
        //check for valid dates
        if (!(submitPlanObj.plan_startdate && submitPlanObj.plan_enddate)) {
            appDispatch({ type: "flashMessage", success: false, message: "invalid dates" });
            return;
        }

        const response = await axiosPost("/plan/edit", submitPlanObj);

        if (response.success) {
            //success edit
            appDispatch({ type: "flashMessage", success: true, message: response.message });
            setEditable(false);
            fetchPlans();
        } else {
            switch (response.errorCode) {
                case "ER_CHAR_INVALID": {
                    appDispatch({ type: "flashMessage", success: false, message: "password needs to be 8-10char and contains alphanumeric and specialcharacter" });
                    break;
                }
                case "ER_NOT_LOGIN": {
                    appDispatch({ type: "logout" });
                    appDispatch({ type: "flashMessage", success: false, message: "Please login again!" });
                    break;
                }
                default: {
                    console.log("uncaught error");
                    appDispatch({ type: "flashMessage", success: false, message: response.message });
                    break;
                }
            }
        }
    }

    return (
        <>
            <TableRow hover>
                <TableCell
                    component="th"
                    scope="row"
                    padding="none"
                >
                    <Typography
                        variant="subtitle2"
                        noWrap
                    >
                        &nbsp;&nbsp;&nbsp;&nbsp; {plan_mvp_name}
                    </Typography>
                </TableCell>

                <TableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start-date"
                            name="plan_startdate"
                            disabled={!editable}
                            value={startDate}
                            onChange={(value) => setStartDate(value)}
                            slotProps={{ textField: { fullWidth: true, size: "small", required: true } }}
                        />
                    </LocalizationProvider>
                </TableCell>

                <TableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start-date"
                            name="plan_enddate"
                            disabled={!editable}
                            value={startDate}
                            onChange={(value) => setEndDate(value)}
                            slotProps={{ textField: { fullWidth: true, size: "small", required: true } }}
                        />
                    </LocalizationProvider>
                </TableCell>

                <TableCell align="right">
                    {editPlanPerm &&
                        (editable ? (
                            <>
                                <IconButton
                                    onClick={handleEditSubmit}
                                    size="small"
                                >
                                    save
                                </IconButton>
                                <IconButton
                                    onClick={cancelEdit}
                                    size="small"
                                >
                                    cancel
                                </IconButton>
                            </>
                        ) : (
                            <IconButton onClick={handleEdit}>edit</IconButton>
                        ))}
                </TableCell>
            </TableRow>
        </>
    );
}
