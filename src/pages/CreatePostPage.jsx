import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { ip, port } from '../assets/config.js';
import {useAuthGuard} from "../components/LoginValid.jsx";
export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useAuthGuard();
    const handleSubmit = async () => {
        setError(null);
        if (!title.trim() || !content.trim()) {
            setError('Заголовок и содержание не могут быть пустыми');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://${ip}:${port}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': localStorage.getItem('token'),
                },
                body: JSON.stringify({
                    Title: title,
                    Content: content,
                }),
            });
            if (res.ok) {
                const newPost = await res.json();
                navigate(`/post/${newPost.id}`); // Перенаправляем на созданный пост
            } else if (res.status === 401) {
                setError('Неавторизованный доступ. Пожалуйста, войдите в систему.');
            } else {
                const data = await res.json();
                setError(data.message || 'Ошибка при создании поста');
            }
        } catch (e) {
            setError('Сетевая ошибка, попробуйте позже');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, fontFamily: 'Roboto, sans-serif' }}>
            <Typography variant="h4" gutterBottom>Создать новый пост</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                label="Заголовок"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Содержание"
                variant="outlined"
                fullWidth
                multiline
                minRows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
            >
                {loading ? 'Создание...' : 'Создать'}
            </Button>
        </Box>
    );
}
