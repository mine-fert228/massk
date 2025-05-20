    import React, { useEffect, useState } from "react";
    import { useParams } from "react-router-dom";
    import {
        Box,
        Typography,
        Avatar,
        CircularProgress,
        Paper,
        TextField,
        Button,
        Divider,
        IconButton,
        Collapse
    } from "@mui/material";
    import FavoriteIcon from "@mui/icons-material/Favorite";
    import ThumbDownIcon from "@mui/icons-material/ThumbDown";
    import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
    import ExpandLessIcon from "@mui/icons-material/ExpandLess";
    import { ip, port } from "../assets/config.js";

    const server = `http://${ip}:${port}`;

    export default function VideoPage() {
        const { id } = useParams();
        const [video, setVideo] = useState(null);
        const [loading, setLoading] = useState(true);

        const [likes, setLikes] = useState(0);
        const [dislikes, setDislikes] = useState(0);
        const [hasReacted, setHasReacted] = useState(null); // 'like', 'dislike', or null

        const [comments, setComments] = useState([]);
        const [newComment, setNewComment] = useState("");
        const [descExpanded, setDescExpanded] = useState(false);

        const token = localStorage.getItem("token");

        // Загрузка видео
        useEffect(() => {
            const fetchVideo = async () => {
                try {
                    const res = await fetch(`${server}/api/Video/Info/${id}`);
                    const data = await res.json();
                    setVideo(data);
                } catch (err) {
                    console.error("Ошибка при получении видео:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchVideo();
        }, [id]);

        // Загрузка лайков и реакции
        useEffect(() => {
            const fetchReactions = async () => {
                try {
                    const res = await fetch(`${server}/api/Video/reactions?videoId=${id}`);
                    const text = await res.text();
                    const count = parseInt(text, 10);
                    setLikes(isNaN(count) ? 0 : count);
                    setDislikes(0);
                } catch {
                    setLikes(0);
                    setDislikes(0);
                }
            };

            const fetchHasReacted = async () => {
                try {
                    const res = await fetch(`${server}/api/Video/hasreacted?videoId=${id}`, {
                        headers: { Token: token }
                    });
                    const json = await res.json(); // тут будет true или false

                    setHasReacted(json ? "like" : null);
                } catch {
                    setHasReacted(null);
                }
            };


            fetchReactions();
            if (token) fetchHasReacted();
        }, [id, token]);

        // Загрузка комментариев
        useEffect(() => {
            const fetchComments = async () => {
                try {
                    const res = await fetch(`${server}/api/Video/comment/${id}?page=1&pageSize=20`, {
                        headers: { Token: token }
                    });
                    const json = await res.json();
                    setComments(json);
                } catch {
                    setComments([]);
                }
            };

            if (token) fetchComments();
        }, [id, token]);

        // Лайк или дизлайк
        const toggleReaction = async (type) => {
            if (!token) return;
            if (hasReacted === type) {
                // отменяем реакцию
                await fetch(`${server}/api/Video/removereaction?videoId=${id}`, {
                    method: "POST",
                    headers: { Token: token }
                });
                setHasReacted(null);
                if (type === "like") setLikes(l => l - 1);
                else setDislikes(d => d - 1);
            } else {
                await fetch(`${server}/api/Video/addreaction?videoId=${id}&type=${type}`, {
                    method: "POST",
                    headers: { Token: token }
                });
                if (hasReacted === "like") setLikes(l => l - 1);
                if (hasReacted === "dislike") setDislikes(d => d - 1);
                if (type === "like") setLikes(l => l + 1);
                else setDislikes(d => d + 1);
                setHasReacted(type);
            }
        };

        // Отправка комментария
        const handleAddComment = async () => {
            if (!newComment.trim()) return;
            try {
                const res = await fetch(`${server}/api/Video/comment/${id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Token: token
                    },
                    body: JSON.stringify({ text: newComment })
                });
                const added = await res.json();
                setComments(prev => [added, ...prev]);
                setNewComment("");
            } catch {
                // обработать ошибку
            }
        };

        if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
        if (!video) return <Typography textAlign="center" mt={5}>Видео не найдено.</Typography>;

        return (
            <Box sx={{ maxWidth: 960, mx: "auto", px: 2, py: 3 }}>
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

                <Typography variant="h5" fontWeight="bold" mb={1}>
                    {video.title}
                </Typography>

                <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <Avatar src={video.author?.avatarUrl || ""} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                            {video.author?.username || "Неизвестный автор"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(video.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2} mb={2}>
                        <Button
                            variant={hasReacted === "like" ? "contained" : "outlined"}
                            color="error"
                            startIcon={<FavoriteIcon />}
                            onClick={() => toggleReaction("like")}
                            disabled={!token}
                            sx={{ minWidth: 100 }}
                        >
                            {likes}
                        </Button>

                    </Box>
                </Box>




                {/* Описание с разворотом */}
                <Box mb={3}>
                    <Typography variant="body2" sx={{ whiteSpace: descExpanded ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

                {/* Комментарии */}
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
                        Войдите, чтобы оставить комментарий.
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {comments.length === 0 ? (
                    <Typography color="text.secondary">Комментариев пока нет.</Typography>
                ) : (
                    <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                        {comments.map((comment) => (
                            <Box key={comment.id} sx={{ mb: 2 }}>
                                <Box display="flex" alignItems="center" mb={1} gap={1}>
                                    <Avatar src={comment.author?.avatarUrl || ""} sx={{ width: 40, height: 40 }} />
                                    <Typography variant="subtitle2" fontWeight="medium">
                                        {comment.author?.username || "Гость"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {comment.text}
                                </Typography>
                                <Divider sx={{ mt: 1 }} />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        );
    }
