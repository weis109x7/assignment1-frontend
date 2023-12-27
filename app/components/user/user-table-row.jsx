import React, { useContext, useEffect } from "react";
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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import InputLabel from "@mui/material/InputLabel";
import { Grid, Container, Paper, TextField, Button } from "@mui/material";

import { Autocomplete } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

// ----------------------------------------------------------------------

export default function UserTableRow({ userId, email, userGroup, status, password }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);

    const [newEmail, setNewEmail] = useImmer(email);
    const [newUserGroup, setNewUserGroup] = useImmer(userGroup);
    const [isActive, setIsActive] = useImmer(status);
    const [newPass, setNewPass] = useImmer("");

    const [groupNames, setGroupNames] = useImmer([]);

    const handleEdit = (event) => {
        setEditable((editable) => !editable);
    };

    const handleisActive = (event) => {
        setIsActive(event.target.value);
    };

    const handleMulti = (event) => {
        setNewUserGroup(event);
    };

    const cancelEdit = (event) => {
        setEditable(false);
        setNewEmail(email);
        setNewPass("");
        setIsActive(status);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        console.log(newPass);
        try {
            const response = await Axios.post("/user/edit", { userId, password: newPass, email: newEmail, userGroup: newUserGroup.join(","), isActive }).catch((error) => {
                // return backend error
                if (error.response) {
                    console.log("backend error");
                    return error.response.data;
                } else {
                    console.log("axios error");
                    throw error;
                }
            });
            console.log("response for user edit:");
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

    if (userGroup) {
        userGroup = userGroup.split(",").sort();
    } else {
        userGroup = undefined;
    }

    const controller = new AbortController();
    useEffect(() => {
        async function fetchResults() {
            try {
                const response = await Axios.post("/group/getGroups", { signal: controller.signal }).catch((error) => {
                    // return backend error
                    if (error.response) {
                        console.log("backend error");
                        return error.response.data;
                    } else {
                        console.log("axios error");
                        throw error;
                    }
                });
                console.log("response for get groupnames:");
                console.log(response);
                if (response.data) {
                    let nameArr = response.data.message.map((a) => a.userGroup);
                    setGroupNames(nameArr);
                } else {
                    console.log("fail getting users");
                }
            } catch (e) {
                console.log("front end error:");
                console.log(e);
            }
        }
        if (editable) fetchResults();
        return () => controller.abort();
    }, [editable]);

    return (
        <>
            <TableRow hover>
                <TableCell component="th" scope="row" padding="none">
                    <Typography variant="subtitle2" noWrap>
                        &nbsp;&nbsp;&nbsp;&nbsp; {userId}
                    </Typography>
                </TableCell>

                <TableCell>{editable ? <TextField value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" label="Password" variant="outlined" autoComplete="off" placeholder="password" /> : password}</TableCell>

                <TableCell>{editable ? <TextField defaultValue={email} onChange={(e) => setNewEmail(e.target.value)} type="text" label="email" variant="outlined" autoComplete="off" placeholder="new email" /> : email}</TableCell>

                <TableCell>
                    {editable ? (
                        <Autocomplete
                            sx={{}}
                            onChange={(e, newvalue) => handleMulti(newvalue)}
                            multiple
                            id="tags-standard"
                            options={groupNames}
                            getOptionLabel={(option) => option}
                            defaultValue={userGroup}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => (
                                <MenuItem key={option} value={option} sx={{ justifyContent: "space-between" }} {...props}>
                                    {option}
                                    {selected ? <CheckIcon color="info" /> : null}
                                </MenuItem>
                            )}
                            renderInput={(params) => <TextField {...params} variant="outlined" label="Groups" placeholder="Group Names" />}
                        />
                    ) : userGroup ? (
                        <Stack direction="row" spacing={0.3}>
                            {userGroup.map((name) => (
                                <Chip label={name} key={name} variant="outlined" />
                            ))}
                        </Stack>
                    ) : (
                        userGroup
                    )}
                </TableCell>

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
