// src/pages/FriendManager.jsx
import { useEffect, useState } from "react";
import { ip, port } from "/src/assets/config.js";
import { Link } from "react-router-dom";
import { useAuthGuard } from "../components/LoginValid.jsx";

import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Button,
    Paper,
    Divider,
} from "@mui/material";


const API_BASE = `http://${ip}:${port}`;
const Token = localStorage.getItem("token");

export default function FriendManager() {
    useAuthGuard();
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/friends/incoming`, {
                    headers: { Token },
                });
                const res2 = await fetch(`${API_BASE}/api/friends/outgoing`, {
                    headers: { Token },
                });

                setIncoming((await res.json()) || []);
                setOutgoing((await res2.json()) || []);

                const friendsRes = await fetch(`${API_BASE}/api/friends/list`, {
                    headers: { Token },
                });
                const friendsData = await friendsRes.json();
                setFriends(friendsData || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAccept = async (id) => {
        await fetch(`${API_BASE}/api/friends/accept/${id}`, {
            method: "PATCH",
            headers: { Token },
        });
        window.location.reload();
    };

    const handleDecline = async (id) => {
        await fetch(`${API_BASE}/api/friends/reject/${id}`, {
            method: "PATCH",
            headers: { Token },
        });
        window.location.reload();
    };

    const handleRemove = async (id) => {
        await fetch(`${API_BASE}/api/friends/unfriend/${id}`, {
            method: "DELETE",
            headers: { Token },
        });
        window.location.reload();
    };

    if (loading)
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );

    return (
        <Container sx={{ mt: 4 }}>


            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Входящие</Typography>
                <Divider sx={{ my: 1 }} />
                {incoming.length === 0 ? (
                    <Typography>Нет входящих заявок</Typography>
                ) : (
                    incoming.map((user) => (
                        <Box key={user.id} display="flex" alignItems="center" gap={2} my={1}>
                            <Typography
                                component={Link}
                                to={`/profile/${user.id}`}
                                sx={{ textDecoration: "none" }}
                            >
                                {user.fromUserName || "Без имени"}
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAccept(user.requestId)}
                            >
                                Принять
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleDecline(user.requestId)}
                            >
                                Отклонить
                            </Button>
                        </Box>
                    ))
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Исходящие</Typography>
                <Divider sx={{ my: 1 }} />
                {outgoing.length === 0 ? (
                    <Typography>Нет исходящих заявок</Typography>
                ) : (
                    outgoing.map((user) => (
                        <Box key={user.toUserId} my={1}>
                            <Typography
                                component={Link}
                                to={`/profile/${user.toUserId}`}
                                sx={{ textDecoration: "none" }}
                            >
                                {user.toUserName || "Без имени"}
                            </Typography>
                        </Box>
                    ))
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Друзья</Typography>
                <Divider sx={{ my: 1 }} />
                {friends.length === 0 ? (
                    <Typography>Нет друзей</Typography>
                ) : (
                    friends.map((user) => (
                        <Box key={user.id} display="flex" alignItems="center" gap={2} my={1}>
                            <Typography
                                component={Link}
                                to={`/profile/${user.friendId}`}
                                sx={{ textDecoration: "none" }}
                            >
                                {user.friendProfile.name || "Без имени"}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleRemove(user.friendId)}
                            >
                                Удалить
                            </Button>
                        </Box>
                    ))
                )}
            </Paper>
        </Container>

    );
}
