import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody, TableCell,
    TableHead, TableRow, Avatar, Tabs, Tab, CircularProgress,
    Card, CardContent, CardMedia, CardActions
} from '@mui/material';

import request from '../api/funcapi.js';
import { ip, port } from '../assets/config';

export default function AdminPanelPage() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [changePassDialogOpen, setChangePassDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const [tab, setTab] = useState(0);

    const [posts, setPosts] = useState([]);
    const [postsPage, setPostsPage] = useState(1);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsHasMore, setPostsHasMore] = useState(true);

    const [videos, setVideos] = useState([]);
    const [videosPage, setVideosPage] = useState(1);
    const [videosLoading, setVideosLoading] = useState(false);
    const [videosHasMore, setVideosHasMore] = useState(true);

    const scrollRef = useRef(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            resetPosts();
            resetVideos();
            loadPosts(1);
            loadVideos(1);
        }
    }, [selectedUserId]);

    async function loadUsers() {
        try {
            const res = await request(`${ip}:${port}/api/admin/users`, 'GET');
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Ошибка загрузки пользователей');
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            alert(e.message || 'Ошибка загрузки пользователей');
        }
    }

    async function banUser(userId) {
        try {
            const res = await request(`${ip}:${port}/api/admin/user/${userId}/ban`, 'POST');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Ошибка при бане');
            }
            loadUsers();
        } catch (e) {
            alert(e.message);
        }
    }
    async function unbanUser(userId) {
        try {
            const res = await request(`${ip}:${port}/api/admin/user/${userId}/unban`, 'POST');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Ошибка при разбане');
            }
            loadUsers();
        } catch (e) {
            alert(e.message);
        }
    }

    async function deleteUser(userId) {
        if (!window.confirm('Удалить пользователя?')) return;
        try {
            const res = await request(`${ip}:${port}/api/admin/user/${userId}`, 'DELETE');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Ошибка удаления');
            }
            loadUsers();
            if (selectedUserId === userId) setSelectedUserId(null);
        } catch (e) {
            alert(e.message);
        }
    }

    async function flushMessages() {
        try {
            const res = await request(`${ip}:${port}/api/admin/flush-messages`, 'POST');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Ошибка сохранения');
            }
            alert('Все сообщения сохранены');
        } catch (e) {
            alert(e.message);
        }
    }

    function openChangePassword(userId) {
        setSelectedUserId(userId);
        setNewPassword('');
        setChangePassDialogOpen(true);
    }
    async function changePassword() {
        if (!newPassword.trim()) {
            alert('Пароль не может быть пустым');
            return;
        }
        try {
            const res = await request(
                `${ip}:${port}/api/admin/user/${selectedUserId}/change-password`,
                'POST',
                JSON.stringify({ newPassword })
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || 'Ошибка смены пароля');
            }
            setChangePassDialogOpen(false);
            alert('Пароль изменён');
        } catch (e) {
            alert(e.message);
        }
    }

    function resetPosts() {
        setPosts([]);
        setPostsPage(1);
        setPostsHasMore(true);
    }
    async function loadPosts(pageToLoad) {
        if (postsLoading || !postsHasMore || !selectedUserId) return;
        setPostsLoading(true);
        try {
            const res = await request(
                `${ip}:${port}/api/admin/user/${selectedUserId}/posts?page=${pageToLoad}&pageSize=10`,
                'GET'
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Ошибка загрузки постов');
            if (data.length === 0) {
                setPostsHasMore(false);
            } else {
                setPosts(prev => [...prev, ...data]);
                setPostsPage(pageToLoad);
            }
        } catch (e) {
            alert(e.message);
        }
        setPostsLoading(false);
    }

    function resetVideos() {
        setVideos([]);
        setVideosPage(1);
        setVideosHasMore(true);
    }
    async function loadVideos(pageToLoad) {
        if (videosLoading || !videosHasMore || !selectedUserId) return;
        setVideosLoading(true);
        try {
            const res = await request(
                `${ip}:${port}/api/admin/user/${selectedUserId}/videos?page=${pageToLoad}&pageSize=10`,
                'GET'
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Ошибка загрузки видео');
            if (data.length === 0) {
                setVideosHasMore(false);
            } else {
                setVideos(prev => [...prev, ...data]);
                setVideosPage(pageToLoad);
            }
        } catch (e) {
            alert(e.message);
        }
        setVideosLoading(false);
    }

    function onScroll(e) {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            if (tab === 0) {
                loadPosts(postsPage + 1);
            } else if (tab === 1) {
                loadVideos(videosPage + 1);
            }
        }
    }

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Админ-панель</Typography>

            <Box mb={2}>
                <Button variant="contained" onClick={flushMessages}>
                    Сохранить все сообщения
                </Button>
            </Box>

            <Typography variant="h5" gutterBottom>Пользователи</Typography>

            {users.length === 0 ? (
                <Typography>Нет пользователей или ошибка загрузки</Typography>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Аватар</TableCell>
                            <TableCell>Имя</TableCell>
                            <TableCell>Айди</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Забанен</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
                            <TableRow
                                key={user.id}
                                hover
                                selected={selectedUserId === user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>
                                    <Avatar
                                        src={user.profile.avatarUrl}
                                        alt={`Аватар ${user.profile.name}`}
                                        sx={{ height: 40, width: 40 }}
                                    />
                                </TableCell>
                                <TableCell>{user.profile.name} ({user.login || '—'})</TableCell>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    {{
                                        0: 'Админ',
                                        1: 'Юзер',
                                        2: 'Модератор',
                                        3: 'Забанен'
                                    }[user.roles] || 'Неизвестно'}
                                </TableCell>
                                <TableCell>{user.roles === 3 ? 'Да' : 'Нет'}</TableCell>
                                <TableCell>
                                    {user.roles === 3 ? (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); unbanUser(user.id); }}
                                            sx={{ mr: 1 }}
                                        >
                                            Разбанить
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); banUser(user.id); }}
                                            sx={{ mr: 1 }}
                                        >
                                            Забанить
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); openChangePassword(user.id); }}
                                        sx={{ mr: 1 }}
                                    >
                                        Сменить пароль
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}
                                    >
                                        Удалить
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {selectedUserId && (
                <Box mt={4} height="60vh" overflow="auto" onScroll={onScroll} ref={scrollRef}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab label="Посты" />
                        <Tab label="Видео" />
                    </Tabs>

                    {tab === 0 && (
                        <Box p={2} display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                            {posts.length === 0 && !postsLoading && <Typography>Постов нет</Typography>}
                            {posts.map(post => (
                                <Card
                                    key={post.id}
                                    sx={{ width: 300, cursor: 'pointer' }}
                                    onClick={() => window.open(`/video/${post.id}`, '_blank')}
                                >
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{post.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {post.content || 'Описание отсутствует'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                            {postsLoading && <CircularProgress size={24} />}
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box p={2} display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                            {videos.length === 0 && !videosLoading && <Typography>Видео нет</Typography>}
                            {videos.map(video => (
                                <Card
                                    key={video.id}
                                    sx={{ width: 300, cursor: 'pointer' }}
                                    onClick={() => window.open(`/video/${video.id}`, '_blank')}
                                >
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={`${ip}:${port}/previews/${video.previewName}`}
                                        alt={video.title}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{video.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {video.description || 'Описание отсутствует'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                            {videosLoading && <CircularProgress size={24} />}
                        </Box>
                    )}
                </Box>
            )}

            <Dialog open={changePassDialogOpen} onClose={() => setChangePassDialogOpen(false)}>
                <DialogTitle>Сменить пароль</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Новый пароль"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChangePassDialogOpen(false)}>Отмена</Button>
                    <Button onClick={changePassword} variant="contained">Сменить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
