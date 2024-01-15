import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

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

import { Button } from "@mui/material";

// ----------------------------------------------------------------------

export default function AppTableRow({ app_acronym, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    return (
        <>
            <TableRow hover>
                <TableCell component="th" scope="row" padding="none">
                    <Typography variant="subtitle2" noWrap>
                        &nbsp;&nbsp;&nbsp;&nbsp; {app_acronym}
                    </Typography>
                </TableCell>

                <TableCell>{app_startdate}</TableCell>

                <TableCell>{app_enddate}</TableCell>

                <TableCell>{app_permit_create}</TableCell>

                <TableCell>{app_permit_open}</TableCell>

                <TableCell>{app_permit_todolist}</TableCell>

                <TableCell>{app_permit_doing}</TableCell>

                <TableCell align="center">{app_permit_done}</TableCell>

                <TableCell align="right">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
                        <Button component={Link} to="/" variant="outlined" size="small">
                            View
                        </Button>
                        <Button component={Link} to="/" variant="contained" size="small">
                            Plans
                        </Button>
                        <Button component={Link} to="/" variant="contained" size="small">
                            Tasks
                        </Button>
                    </Stack>
                </TableCell>
            </TableRow>
        </>
    );
}
