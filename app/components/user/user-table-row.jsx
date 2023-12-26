import React, { useContext } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useImmer } from "use-immer";
import Axios from "axios";
import StateContext from "../../StateContext.js";
import DispatchContext from "../../DispatchContext.js";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import InputLabel from "@mui/material/InputLabel";
import { Grid, Container, Paper, TextField, Button } from "@mui/material";
// ----------------------------------------------------------------------

export default function UserTableRow({ userId, email, userGroup, status, password }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);

    const [newPass, setNewPass] = useImmer("");
    const [newEmail, setNewEmail] = useImmer(email);
    const [newUserGroup, setNewUserGroup] = useImmer(userGroup);
    const [isActive, setIsActive] = useImmer(status);

    const handleEdit = (event) => {
        setEditable((editable) => !editable);
    };

    const handleisActive = (event) => {
        setIsActive(event.target.value);
    };

    const cancelEdit = (event) => {
        setEditable(false);
        setNewEmail("");
        setNewPass("");
    };

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(newPass);
        try {
            const response = await Axios.post("/user/edit", { userId, password: newPass, email: newEmail, userGroup: newUserGroup, isActive }).catch((error) => {
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
                appDispatch({ type: "flashMessage", value: "You have successfully edit user." });
                setEditable(false);
            } else {
                appDispatch({ type: "flashMessage", value: "edit user failed." });
            }
        } catch (e) {
            console.log("front end error:");
            console.log(e);
        }
    }

    return (
        <>
            <TableRow hover>
                <TableCell component="th" scope="row" padding="none">
                    <Typography variant="subtitle2" noWrap>
                        &nbsp;&nbsp;&nbsp;&nbsp; {userId}
                    </Typography>
                </TableCell>

                <TableCell>{editable ? <TextField value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" label="new Password" variant="outlined" required autoComplete="off" placeholder="new password" /> : password}</TableCell>

                <TableCell>{editable ? <TextField defaultValue={email} onChange={(e) => setNewEmail(e.target.value)} type="text" label="email" variant="outlined" required autoComplete="off" placeholder="new email" /> : email}</TableCell>

                <TableCell>{editable ? "edit user grou phere" : userGroup}</TableCell>

                <TableCell align="center">
                    {editable ? (
                        <TextField
                            value={isActive}
                            onChange={(e) => setIsActive(e.target.value)}
                            select // tell TextField to render select
                            label="active"
                        >
                            <MenuItem value="active">active</MenuItem>
                            <MenuItem value="disabled">disabled</MenuItem>
                        </TextField>
                    ) : (
                        status
                    )}
                </TableCell>

                <TableCell align="right">
                    {editable ? (
                        <>
                            <IconButton onClick={handleSubmit} size="small">
                                save
                            </IconButton>
                            <IconButton onClick={cancelEdit} size="small">
                                cancel
                            </IconButton>
                        </>
                    ) : (
                        <IconButton onClick={handleEdit}>edit</IconButton>
                    )}
                </TableCell>
            </TableRow>
        </>
    );
}
