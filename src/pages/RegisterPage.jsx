import React, { useState, useEffect } from 'react';
import { register } from '../api/auth.js';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Checkbox,
    FormControlLabel,
    Link
} from '@mui/material';



export default function RegisterPage() {
    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [agree, setAgree] = useState(false);
    const [kazik, setKazik] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [spinIndex, setSpinIndex] = useState(0);

    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!agree) {
            setError('Вы должны принять лицензионное соглашение');
            return;
        }
        try {
            await register(loginValue, password);
            navigate('/feed');
            window.location.reload();
        } catch (e) {
            setError(e.message);
        }
    };

    // Запускаем анимацию барабана и по окончании показываем казика


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
                userSelect: 'none',
            }}
        >




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
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={agree}
                        onChange={e => setAgree(e.target.checked)}
                    />
                }
                label={
                    <Typography variant="body2">
                        Я принимаю{' '}
                        <Link href="/license" target="_blank" rel="noopener">
                            лицензионное соглашение
                        </Link>
                    </Typography>
                }
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleRegister}
                fullWidth
                size="large"
                disabled={!agree}
            >
                Зарегистрироваться
            </Button>
            <Typography textAlign="center">
                Есть аккаунт?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                    Войди
                </Link>
            </Typography>
        </Box>
    );
}
