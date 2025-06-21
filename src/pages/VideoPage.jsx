import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    Avatar,
    CircularProgress,
    TextField,
    Button,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ip, port } from "../assets/config.js";
import { getMyId } from "../api/auth.js";
import { toast, ToastContainer } from "react-toastify";
import request from "../api/funcapi.js";


const server = `http://${ip}:${port}`;

export default function VideoPage() {

    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [hasReacted, setHasReacted] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [descExpanded, setDescExpanded] = useState(false);
    const [yourUserId, setYourUserId] = useState(null);
    const token = localStorage.getItem("token");
    const [isPublic, setIsPublic] = useState(false);
    const [tags, setTags] = useState("");

    // Модалки
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const [confirmText, setConfirmText] = useState("Ты уверен?");

    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");


    const openConfirm = (text, callback) => {
        setConfirmText(text);
        setConfirmCallback(() => callback);
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setConfirmCallback(null);
    };

    const handleConfirmOk = () => {
        if (confirmCallback) confirmCallback();
        handleConfirmClose();
    };

    useEffect(() => {
        setYourUserId(getMyId());
    }, []);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await request(`${server}/api/Video/Info/${id}`,'GET');
                const data = await res.json();
                setVideo(data);
            } catch {
                toast.error("Ошибка при получении видео");
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const handleDeleteVideo = () => {
        openConfirm("Ты уверен, что хочешь удалить видео?", async () => {
            try {
                await request(`${server}/api/Video/delete/${id}`, "DELETE",);
                window.location.href = "/video/feed";
            } catch (err) {
                toast.error("Ошибка удаления:", err);

            }
        });
    };

    const openEditModal = () => {
        setEditTitle(video.title);
        setEditDescription(video.description || "");
        setIsPublic(video.isPublic || false); // зависит от твоего API
        setTags(video.tags?.join(", ") || "");
        setEditOpen(true);
    };


    const handleEditVideo = async () => {
        try {
            const res = await fetch(`${server}/api/Video/edit/${video.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Token: token
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    isPublic,
                    tags: tags.split(",").map(tag => tag.trim()).filter(Boolean)
                })
            });
            if (res.status === 401) {
                localStorage.setItem('session', false);
                localStorage.removeItem('token');


            }
            if (res.status === 403) {
                window.location.replace("/error/403");
            }
            if (res.status === 404) {
                window.location.replace("/error/404");
            }
            setVideo(prev => ({
                ...prev,
                title: editTitle,
                description: editDescription,
            }));
            toast.success("Видео обновлено");
            setEditOpen(false);
        } catch {
            toast.error("Ошибка при обновлении видео");
        }
    };

    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const res = await request(`${server}/api/Video/reactions?videoId=${id}`,'GET');
                const text = await res.text();
                const count = parseInt(text, 10);
                setLikes(isNaN(count) ? 0 : count);
            } catch {
                setLikes(0);
            }
        };

        const fetchHasReacted = async () => {
            try {
                const res = await request(`${server}/api/Video/hasreacted?videoId=${id}`,'GET');
                const json = await res.json();
                setHasReacted(json ? "like" : null);
            } catch {
                setHasReacted(null);
            }
        };

        fetchReactions();
        if (token) fetchHasReacted();
    }, [id, token]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await request(`${server}/api/Video/comment/${id}?page=1&pageSize=20`,'GET');
                const json = await res.json();
                setComments(json);
            } catch {
                setComments([]);
            }
        };

        if (token) fetchComments();
    }, [id, token]);

    const handleDeleteComment = (commentId) => {
        openConfirm("Ты уверен, что хочешь удалить комментарий?", async () => {
            try {
                await request(`${server}/api/Video/comment/${commentId}`, "DELETE");
                setComments(prev => prev.filter(c => c.id !== commentId));
            } catch (err) {
                console.error("Ошибка удаления комментария:", err);
                toast.error("Ошибка при удалении комментария");
            }
        });
    };

    const toggleReaction = async () => {
        if (!token) return;
        if (hasReacted === "like") {
            await request(`${server}/api/Video/addreaction?videoId=${id}`, "POST");
            setHasReacted(null);
            setLikes(l => l - 1);
        } else {
            await request(`${server}/api/Video/addreaction?videoId=${id}&type=like`,"POST");
            if (hasReacted === "like") setLikes(l => l - 1);
            setLikes(l => l + 1);
            setHasReacted("like");
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const res = await request(`${server}/api/Video/comment/${id}`,"POST",JSON.stringify({ text: newComment }));
            const added = await res.json();
            setComments(prev => [added, ...prev]);
            setNewComment("");
        } catch {toast.error("ошибка")}
    };

    if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
    if (!video) return <Typography textAlign="center" mt={5}>Видео не найдено.</Typography>;

    return (
        <Box sx={{ maxWidth: 960, mx: "auto", px: 2, py: 3 }}>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />

            <Box
                component="video"
                src={`${server}/api/Video/file/${video.id}`}
                controls
                poster={video.previewUrl}
                sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.3)",
                    mb: 2,
                    backgroundColor: "#000"
                }}
            />

            <Typography variant="h5" fontWeight="bold" mb={1}>{video.title}</Typography>


            <Box display="flex" alignItems="center" mb={2} gap={1}>
                <Avatar src={video.author?.avatarUrl || ""} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                        {video.author?.username || "Неизвестный автор"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(video.createdAt).toLocaleString()}
                    </Typography>
                </Box>
                <Box display="flex" gap={2} mb={2}>
                    <Button
                        variant={hasReacted === "like" ? "contained" : "outlined"}
                        color="error"
                        startIcon={<FavoriteIcon />}
                        onClick={toggleReaction}
                        disabled={!token}
                        sx={{ minWidth: 100 }}
                    >
                        {likes}
                    </Button>
                </Box>

                {video.author?.id === yourUserId && (
                    <Box display="flex" gap={1} ml="auto">
                        <Button variant="outlined" color="primary" onClick={openEditModal}>
                            Редактировать
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleDeleteVideo}>
                            Удалить
                        </Button>
                    </Box>
                )}
            </Box>

            <Box mb={3}>
                <Typography variant="body2" sx={{
                    whiteSpace: descExpanded ? "normal" : "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    {video.description || "Описание отсутствует."}
                </Typography>
                {video.description?.length > 150 && (
                    <Button
                        size="small"
                        endIcon={descExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setDescExpanded(!descExpanded)}
                    >
                        {descExpanded ? "Свернуть" : "Развернуть"}
                    </Button>
                )}
            </Box>

            <Typography variant="h6" mb={2}>
                Комментарии ({comments.length})
            </Typography>

            {token ? (
                <>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Добавить комментарий..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()}>
                        Отправить
                    </Button>
                </>
            ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Войдите, чтобы оставлять комментарии.
                </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {comments.map(comment => (
                <Box key={comment.id} mb={2} display="flex" alignItems="flex-start" gap={2}>
                    <Avatar src={comment.author?.avatarUrl || ""} />
                    <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="medium">
                            {comment.author?.username || "Аноним"}
                        </Typography>

                        <Typography variant="body2" whiteSpace="pre-wrap">{comment.text}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                    {comment.author?.id === yourUserId && (
                        <IconButton
                            edge="end"
                            aria-label="удалить"
                            onClick={() => handleDeleteComment(comment.id)}
                        >
                            ❌
                        </IconButton>
                    )}
                </Box>
            ))}

            {/* Модальное окно подтверждения */}
            <Dialog open={confirmOpen} onClose={handleConfirmClose}>
                <DialogTitle>Подтверждение</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmText}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmClose}>Отмена</Button>
                    <Button onClick={handleConfirmOk} autoFocus>ОК</Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно редактирования */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактировать видео</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Название"
                        margin="normal"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Описание"
                        multiline
                        rows={4}
                        margin="normal"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                    />

                    <Box mt={2}>
                        <label>
                            <input
                                type="checkbox"
                                checked={!isPublic}
                                onChange={e => setIsPublic(e.target.checked)}
                                style={{ marginRight: 8 }}
                            />
                            Доступ по ссылке
                        </label>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Отмена</Button>
                    <Button onClick={handleEditVideo} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}