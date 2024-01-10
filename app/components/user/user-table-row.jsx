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

// ----------------------------------------------------------------------

export default function UserTableRow({ userId, email, userGroup, status, password, fetchAllUsers, fetchGroupNames, groupNameOptions }) {
    const appDispatch = useContext(DispatchContext);
    const appState = useContext(StateContext);

    const [editable, setEditable] = useImmer(false);

    const [newEmail, setNewEmail] = useImmer(email);
    const [newUserGroup, setNewUserGroup] = useImmer(userGroup);
    const [isActive, setIsActive] = useImmer(status);
    const [newPass, setNewPass] = useImmer("");

    const handleEdit = (event) => {
        setEditable((editable) => !editable);
    };

    const handleisActive = (event) => {
        setIsActive(event.target.value);
    };

    const cancelEdit = (event) => {
        setEditable(false);
        setNewEmail(email ? email : "");
        setNewUserGroup(userGroup);
        setNewPass("");
        setIsActive(status);
    };

    async function handleEditSubmit(e) {
        e.preventDefault();
        const joinedUserGroup = newUserGroup ? newUserGroup.join(",") : "";
        const response = await axiosPost("/user/edit", { userId, password: newPass, email: newEmail, userGroup: joinedUserGroup, isActive });

        if (response.success) {
            //success edit
            appDispatch({ type: "flashMessage", success: true, message: response.message });
            fetchAllUsers();
            setEditable(false);
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

    useEffect(() => {
        if (editable) {
            fetchGroupNames();
            fetchAllUsers();
        }
    }, [editable]);

    useEffect(() => {
        setNewEmail(email ? email : "");
        setNewUserGroup(userGroup);
    }, [email, userGroup]);

    return (
        <>
            <TableRow hover>
                <TableCell component="th" scope="row" padding="none">
                    <Typography variant="subtitle2" noWrap>
                        &nbsp;&nbsp;&nbsp;&nbsp; {userId}
                    </Typography>
                </TableCell>

                <TableCell>{editable ? <TextField value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" label="Password" variant="outlined" autoComplete="off" placeholder="password" /> : password}</TableCell>

                <TableCell>{editable ? <TextField value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="text" label="email" variant="outlined" autoComplete="off" placeholder="new email" /> : email}</TableCell>

                <TableCell>
                    {editable ? (
                        <Autocomplete
                            sx={{}}
                            onChange={(e, newvalue) => {
                                setNewUserGroup(newvalue);
                            }}
                            multiple
                            id="tags-standard"
                            options={groupNameOptions}
                            getOptionLabel={(option) => option}
                            value={newUserGroup}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => (
                                <MenuItem key={option} value={option} sx={{ justifyContent: "space-between" }} {...props}>
                                    {option}
                                    {selected ? <Check color="info" /> : null}
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
                            onChange={handleisActive}
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
                            <IconButton onClick={handleEditSubmit} size="small">
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
