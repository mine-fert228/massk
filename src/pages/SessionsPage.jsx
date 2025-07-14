import React, { useEffect, useState } from "react";
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    Chip, Button, useMediaQuery
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { ip, port } from "../assets/config.js";
import * as UAParser from "ua-parser-js";

function cleanIp(ip) {
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    return ip;
}

function SessionUserAgent({ userAgent }) {
    const parser = new UAParser.UAParser(userAgent);
    const result = parser.getResult();

    return (
        <div style={{ fontSize: '0.85rem' }}>
            <div>🌐 {result.browser.name || "Unknown"} {result.browser.version || ""}</div>
            <div>🪟 {result.os.name || "Unknown"} {result.os.version || ""}</div>
            <div>📱 {result.device.vendor || ""} {result.device.model || ""}</div>
        </div>
    );
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');

    const fetchSessions = () => {
        setLoading(true);
        axios.get(`${ip}:${port}/api/account/sessions`, {
            headers: { "Token": localStorage.getItem("token") }
        })
            .then(res => setSessions(res.data))
            .catch(err => console.error("Ошибка при получении сессий:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const stopSession = (publicId) => {
        setDeleting(true);
        axios.delete(`${ip}:${port}/api/account/stop/${publicId}`, {
            headers: { "Token": localStorage.getItem("token") }
        })
            .then(() => fetchSessions())
            .catch(err => {
                console.error("Ошибка при удалении сессии:", err);
                setDeleting(false);
            })
            .finally(() => setDeleting(false));
    };

    const stopAllSessions = () => {
        if (!window.confirm("Точно остановить все сессии?")) return;

        setDeleting(true);
        axios.delete(`${ip}:${port}/api/account/stopAll`, {
            headers: { "Token": localStorage.getItem("token") }
        })
            .then(() => fetchSessions())
            .catch(err => {
                console.error("Ошибка при удалении всех сессий:", err);
                setDeleting(false);
            })
            .finally(() => setDeleting(false));
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                Активные сессии
            </Typography>

            <Button
                variant="contained"
                color="error"
                onClick={stopAllSessions}
                disabled={loading || deleting}
                sx={{
                    mb: 2,
                    width: isMobile ? "100%" : "auto",
                    fontSize: isMobile ? "1.1rem" : "inherit",
                    py: isMobile ? 1.5 : 1,
                }}
            >
                Остановить все сессии
            </Button>

            {loading ? (
                <CircularProgress />
            ) : isMobile ? (
                <Box>
                    {sessions.map(session => (
                        <Paper
                            key={session.publicId}
                            elevation={2}
                            sx={{
                                mb: 2,
                                p: 2,
                                backgroundColor: session.thisClient ? "#e3f2fd" : "inherit"
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>IP:</strong> {cleanIp(session.ip)}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Начало:</strong> {dayjs(session.sessionStarted).format("YYYY-MM-DD HH:mm:ss")}
                            </Typography>

                            <Typography variant="body2">
                                <strong>Гео:</strong> {session.country || "—"}, {session.city || "—"}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {session.thisClient ? (
                                    <Chip label="Этот клиент" color="primary" size="small" />
                                ) : (
                                    <Chip label="Удалённый" variant="outlined" size="small" />
                                )}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                sx={{ mt: 1 }}
                                size="small"
                                disabled={deleting}
                                onClick={() => stopSession(session.publicId)}
                            >
                                Остановить
                            </Button>
                        </Paper>
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="medium" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>IP-адрес</TableCell>
                                <TableCell>User-Agent (подробно)</TableCell>
                                <TableCell>Гео</TableCell>
                                <TableCell>Начало сессии</TableCell>

                                <TableCell>Клиент</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions.map(session => (
                                <TableRow
                                    key={session.publicId}
                                    sx={session.thisClient ? { backgroundColor: "#e3f2fd" } : {}}
                                >
                                    <TableCell>{cleanIp(session.ip)}</TableCell>
                                    <TableCell sx={{ maxWidth: 250, wordBreak: "break-word", fontSize: '0.85rem' }}>
                                        <SessionUserAgent userAgent={session.userAgent} />
                                    </TableCell>
                                    <TableCell>
                                        {session.country || "—"}, {session.city || "—"}
                                    </TableCell>
                                    <TableCell>
                                        {dayjs(session.sessionStarted).format("YYYY-MM-DD HH:mm:ss")}
                                    </TableCell>

                                    <TableCell>
                                        {session.thisClient ? (
                                            <Chip label="Этот клиент" color="primary" />
                                        ) : (
                                            <Chip label="Удалённый" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="medium"
                                            disabled={deleting}
                                            onClick={() => stopSession(session.publicId)}
                                        >
                                            Остановить
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
