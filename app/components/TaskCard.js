import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea, Stack } from "@mui/material";
import Chip from "@mui/material/Chip";

export default function TaskCard({ task_name, task_id, task_owner, task_plan, openModal }) {
    return (
        <Card sx={{ width: "100%" }}>
            <CardActionArea onClick={openModal}>
                <CardContent>
                    <Typography
                        style={{ wordWrap: "break-word" }}
                        variant="subtitle2"
                        component="div"
                    >
                        {task_name}
                    </Typography>
                    {task_plan && (
                        <Chip
                            label={task_plan}
                            key={task_plan}
                            size="small"
                        />
                    )}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            #{task_id}
                        </Typography>
                        {task_owner}
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
