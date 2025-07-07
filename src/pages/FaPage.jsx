import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, TextField, Button, Box,
    Divider, CircularProgress
} from '@mui/material';
import QRCodeComponent from "../assets/generateqrcode.jsx";
import request from "../api/funcapi.js";
import { ip, port } from "../assets/config.js";

function FaPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [enabled, setEnabled] = useState(localStorage.getItem("2fa") === "true");

    const [qrData, setQrData] = useState('');
    const [secret, setSecret] = useState('');

    useEffect(() => {
        fetch2FAData();
    }, [enabled]);

    const fetch2FAData = async () => {
        try {
            setLoading(true);
            const res = await request(`${ip}:${port}/api/Account/enable-2fa`, "POST");
            const data = await res.json();


                setQrData(data.otpAuthUrl);
                setSecret(data.secret);

        } catch (err) {
            setError(err.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (code.length !== 6) return setError('Введите 6-значный код');

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const res = await request(
                `${ip}:${port}/api/Account/validate-2fa`,
                "POST",
                JSON.stringify({ secret, code })
            );

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('2fa', 'true');
                setEnabled(true);
                setCode('');
                setSuccess('2FA успешно включена ✅');
            } else {
                throw new Error(data.message || 'Неверный код ❌');
            }
        } catch (err) {
            setError(err.message || 'Ошибка при подтверждении');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (code.length !== 6) return setError('Введите код для отключения');

        try {
            setLoading(true);
            setError('');

            const res = await request(
                `${ip}:${port}/api/Account/disable-2fa?code=${code}`,
                'DELETE'
            );

            if (!res.ok) throw new Error('Ошибка при отключении');

            localStorage.setItem("2fa", 'false');
            setEnabled(false);
            setDeleted(true);
            setConfirming(false);
            setCode('');
        } catch (err) {
            setError(err.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    // === UI ===

    if (deleted) {
        return (
            <Paper elevation={3} sx={{ p: 3, mt: 4, maxWidth: 400, mx: 'auto' }}>
                <Typography variant="h6" color="success.main" align="center">
                    2FA отключена успешно
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, mt: 5, maxWidth: 450, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                {enabled ? "Отключение 2FA" : "Включение двухфакторной аутентификации"}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                {enabled
                    ? "Введите 6-значный код для подтверждения отключения"
                    : "Отсканируйте QR-код и введите 6-значный код из Google Authenticator"}
            </Typography>

            {!enabled && (
                <Box display="flex" justifyContent="center" my={2}>
                    {loading ? (
                        <CircularProgress />
                    ) : qrData ? (
                        <QRCodeComponent data={qrData} key={qrData} />
                    ) : (
                        <Typography color="error">QR-код не получен</Typography>
                    )}
                </Box>
            )}

            <TextField
                label="Код подтверждения"
                variant="outlined"
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 6 }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
            />

            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 1 }}>{success}</Typography>}

            <Box mt={3}>
                {!enabled ? (
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={loading || code.length !== 6}
                        onClick={handleSubmit}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Включить 2FA"}
                    </Button>
                ) : confirming ? (
                    <Box display="flex" gap={2}>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={handleDelete}
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Подтвердить"}
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setConfirming(false)}
                        >
                            Отмена
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => setConfirming(true)}
                    >
                        Отключить 2FA
                    </Button>
                )}
            </Box>
        </Paper>
    );
}

export default FaPage;
