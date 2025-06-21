import React, { useState } from 'react';
import { login } from '../api/auth.js';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Link
} from '@mui/material';

export default function LoginPage() {
    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!loginValue.trim() || !password.trim()) {
            setError("Поля логина и пароля обязательны");
            return;
        }

        try {
            await login(loginValue, password);
            navigate('/post/feed');
            window.location.reload();
        } catch (e) {
            setError(e.message);
        }
    };


    return (
        <Box
            sx={{
                maxWidth: 360,
                mx: 'auto',
                mt: 8,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Typography variant="h4" component="h1" textAlign="center">
                Вход
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
                label="Логин"
                variant="outlined"
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                fullWidth
                autoFocus
            />

            <TextField
                label="Пароль"
                type="password"
                variant="outlined"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                onKeyDown={e => {
                    if (e.key === 'Enter') handleLogin();
                }}
            />


            <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                fullWidth
                size="large"
                disabled={!loginValue.trim() || !password.trim()}
            >
                Войти
            </Button>


            <Typography textAlign="center">
                Нет аккаунта?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                    Зарегистрируйся
                </Link>
            </Typography>
        </Box>
    );
}
