import PropTypes from "prop-types";
import React from "react";
import Toolbar from "@mui/material/Toolbar";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

// ----------------------------------------------------------------------

export default function UserTableToolbar({ filterName, onFilterName }) {
    return (
        <Toolbar
            sx={{
                height: 96,
                display: "flex",
                justifyContent: "space-between",
            }}
        >
            <OutlinedInput value={filterName} onChange={onFilterName} placeholder="Search..." size="small" />
        </Toolbar>
    );
}
