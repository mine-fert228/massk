import React, { useState } from 'react';
import { login, verify2fa } from '../api/auth.js';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { IoLogIn } from "react-icons/io5";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Link
} from '@mui/material';
import {SlLogin} from "react-icons/sl";

export default function LoginPage() {
    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState(null);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!loginValue.trim() || !password.trim()) {
            setError("Поля логина и пароля обязательны");
            return;
        }

        try {
            const response = await login(loginValue, password);

            if (response.twoFactorRequired && response.twoFactorToken) {
                setTwoFactorToken(response.twoFactorToken);
                setStep(2);
                setError('');
                return;
            }

            // Если всё прошло без 2FA
            navigate('/post/feed');
            window.location.reload();

        } catch (e) {
            setError(e.message || 'Ошибка входа');
        }
    };


    const handle2fa = async () => {
        if (!code.trim()) {
            setError("Введите код подтверждения");
            return;
        }

        try {
            const response = await verify2fa(twoFactorToken, code);
            if (response.success) {
                navigate('/post/feed');
                window.location.reload();
            } else {
                setError(response.message || 'Неверный код');
            }
        } catch (e) {
            setError(e.message || 'Ошибка подтверждения');
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
            <Typography variant="h4" textAlign="center">
                {step === 1 ? 'Вход' : 'Код подтверждения'}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {step === 1 && (
                <>
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
                        <SlLogin />
                    </Button>

                    <Typography textAlign="center">
                        Нет аккаунта?{' '}
                        <Link component={RouterLink} to="/register" underline="hover">
                            Зарегистрируйся
                        </Link>
                    </Typography>
                </>
            )}

            {step === 2 && (
                <>
                    <Typography textAlign="center">
                        Введите код из приложения
                    </Typography>

                    <TextField
                        label="Код подтверждения"
                        variant="outlined"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        fullWidth
                        onKeyDown={e => {
                            if (e.key === 'Enter') handle2fa();
                        }}
                        autoFocus
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handle2fa}
                        fullWidth
                        size="large"
                        disabled={!code.trim()}
                    >
                        Подтвердить
                    </Button>
                </>
            )}
        </Box>
    );
}
