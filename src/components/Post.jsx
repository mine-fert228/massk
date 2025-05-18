// src/components/Post.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    CardActions,
    Button,
} from '@mui/material';

export default function Post({ title, id }) {
    return (
        <Card sx={{ maxWidth: 500, m: '20px auto', borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                    {title}
                </Typography>
            </CardContent>
            <CardActions>
                <Button
                    component={RouterLink}
                    to={`/post/${id}`}
                    size="small"
                    color="primary"
                >
                    Читать далее
                </Button>
            </CardActions>
        </Card>
    );
}
