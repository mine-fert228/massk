import React, { useState } from 'react';
import {
    Tabs,
    Tab,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
} from '@mui/material';
import SessionsPage from './SessionsPage';
import request from "../api/funcapi.js";
import {ip, port} from "../assets/config.js"; // ты уже сказал, что он у тебя есть
import FaPage from "../pages/FaPage.jsx";
function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

export default function SettingsPage() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Paper elevation={3} sx={{ p: 2, maxWidth: 1000, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Настройки
            </Typography>

            <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>

                <Tab label="Сменить пароль" />
                <Tab label="Сессии" />
                <Tab label="2fa" />

            </Tabs>



            <TabPanel value={tabIndex} index={0}>
                <PasswordTab />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
                <SessionsPage />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <FaPage />
            </TabPanel>

        </Paper>
    );
}




function PasswordTab() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await request(
                `${ip}:${port}/api/Account/changePass`,
                'PATCH',

                JSON.stringify({
                    oldPassword,
                    newPassword
                })
            );

            const data = await res.json();
            if(data.success == false) {
                setMessage('Ошибка при смене пароля');
            }
            else{
                setMessage(data.message || 'Пароль изменён');
            }
            if(res.status == 400){
                setMessage('Ошибка при смене пароля');
            }
        } catch {
            setMessage('Ошибка при смене пароля');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleChange} sx={{ mt: 2 }}>
            <TextField
                fullWidth
                label="Старый пароль"
                type="required"
                margin="normal"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
                fullWidth
                label="Новый пароль"
                type="required"
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Сменить пароль'}
            </Button>
            <Typography sx={{ mt: 2 }} color="primary">
                {message}
            </Typography>
        </Box>
    );
}

