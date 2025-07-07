import React from "react";
import { Card, CardContent, Typography, Button, CardActions, Avatar, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Post({ id, title, author ,excerpt}) {
    return (
        <Card sx={{ maxWidth: 600, margin: "20px auto" }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={author?.avatarUrl || ""} alt={author?.username || "Автор"} sx={{ marginRight: 2 }} />
                    <a href={`/profile/${author.id}`}>
                    <Typography variant="subtitle2" color="text.secondary">
                        {author?.username || "Неизвестный автор"}
                    </Typography>
                    </a>
                </Box>

                <Typography variant="h5" component="div" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div" gutterBottom>
                    {excerpt}
                </Typography>
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    component={RouterLink}
                    to={`/post/${id}`}
                >
                    Читать далее
                </Button>
            </CardActions>
        </Card>
    );
}
