import React from "react";
import { Card, CardContent, Skeleton, CardActions, Avatar, Box } from "@mui/material";

export default function PostSkeleton() {
    return (
        <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                    <Skeleton variant="circular">
                        <Avatar />
                    </Skeleton>
                    <Skeleton width="40%" height={24} sx={{ ml: 2 }} />
                </Box>

                <Skeleton variant="text" height={32} width="80%" />
                <Skeleton variant="text" height={32} width="90%" />
                <Skeleton variant="text" height={32} width="70%" />
            </CardContent>

            <CardActions>
                <Skeleton variant="rectangular" width={100} height={36} />
            </CardActions>
        </Card>
    );
}
