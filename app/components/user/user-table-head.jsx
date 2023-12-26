import React from "react";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";

// ----------------------------------------------------------------------

export default function UserTableHead({ order, orderBy, headLabel, onRequestSort }) {
    const onSort = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headLabel.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.align || "left"} sortDirection={orderBy === headCell.id ? order : false} sx={{ width: headCell.width, minWidth: headCell.minWidth }}>
                        <TableSortLabel hideSortIcon active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={onSort(headCell.id)}>
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
