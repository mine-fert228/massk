import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchPost } from '../api/fetchFeed';
import { ip, port } from '../assets/config.js';
import { IconButton, TextField, Button } from '@mui/material';
import { useAuthGuard } from "../components/LoginValid.jsx";
import { getMyId } from "../api/auth.js";
import {
    Card,
    CardHeader,
    CardContent,
    Avatar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Link,
    Box,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
function ToastWithButtons({ resolve }) {
    const handleOk = () => {
        toast.dismiss();
        resolve(true); // ответ: ОК
    };

    const handleCancel = () => {
        toast.dismiss();
        resolve(false); // ответ: Отмена
    };

    return (
        <div>
            <p>Ты уверен?</p>
            <button onClick={handleOk} style={{ marginRight: 8 }}>ОК</button>
            <button onClick={handleCancel}>Отмена</button>
        </div>
    );
}
export default function PostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [myId, setMyId] = useState(null);

    useAuthGuard();

    useEffect(() => {
        const loadMyId = async () => {
            const id = await getMyId();
            setMyId(id);
        };
        loadMyId();
    }, []);

    useEffect(() => {
        loadPostData();
        loadComments();
    }, [id]);

    const loadPostData = async () => {
        try {
            const fetchedPost = await fetchPost(id);
            setPost(fetchedPost);
            setEditTitle(fetchedPost.title);
            setEditContent(fetchedPost.content);

            const reactionRes = await fetch(`http://${ip}:${port}/api/posts/${id}/reactions`, {
                headers: {
                    Token: localStorage.getItem('token'),
                },
            });

            if (reactionRes.ok) {
                const data = await reactionRes.json();
                setLikes(data.likes ?? 0);
            }
        } catch (error) {
            console.error('Ошибка загрузки поста:', error);
        }
    };

    const loadComments = async () => {
        try {
            const res = await fetch(`http://${ip}:${port}/api/posts/${id}/comments`, {
                headers: {
                    Token: localStorage.getItem('token'),
                },
            });

            if (!res.ok) throw new Error('Не удалось загрузить комментарии');
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error("Ошибка загрузки комментариев:", error);
        }
    };

    const handleLike = async () => {
        if (hasLiked) return;
        setLikes((prev) => prev + 1);
        setHasLiked(true);

        try {
            await fetch(`http://${ip}:${port}/api/posts/${id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: localStorage.getItem('token'),
                },
                body: JSON.stringify({ IsLiked: true }),
            });
        } catch (error) {
            console.error('Ошибка при лайке:', error);
        }
    };
    const showConfirmToast = () => {
        return new Promise((resolve) => {
            toast.info(<ToastWithButtons resolve={resolve} />, {
                autoClose: false,
                closeButton: false,
                draggable: false,
            });
        });
    };
    const handleDelete = async () => {

        const result = await showConfirmToast();
        if(!result){ return;}

        try {
            await fetch(`http://${ip}:${port}/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    Token: localStorage.getItem('token'),
                },
            });
            navigate('/');
        } catch (error) {
            console.error("Ошибка удаления поста:", error);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (post) {
            setEditTitle(post.title);
            setEditContent(post.content);
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`http://${ip}:${port}/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Token: localStorage.getItem('token'),
                },
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent,
                }),
            });
            if (res.ok) {
                const updatedPost = await res.json();
                setPost(updatedPost);
                setIsEditing(false);
            } else {
                console.error('Ошибка при обновлении поста');
            }
        } catch (error) {
            console.error('Ошибка при сохранении изменений:', error);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`http://${ip}:${port}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: localStorage.getItem('token'),
                },
                body: JSON.stringify({ Content: commentText }),
            });
            if (res.ok) {
                setCommentText("");
                loadComments();
            }
        } catch (err) {
            console.error("Ошибка при добавлении комментария:", err);
        }
    };

    // Новый обработчик удаления комментария
    const handleDeleteComment = async (commentId) => {
        const result = await showConfirmToast();
        if(!result){ return;}

        try {
            const res = await fetch(`http://${ip}:${port}/api/posts/comment/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Token: localStorage.getItem('token'),
                },
            });
            if (res.ok) {
                loadComments();
            } else {
                console.error('Ошибка удаления комментария');
            }
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
        }
    };

    if (!post) {
        return <Typography variant="h6" align="center">Загрузка поста...</Typography>;
    }

    const isAuthor = myId === post.author.id;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2, fontFamily: 'Roboto, sans-serif' }}>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"

            />
            <Card variant="outlined" sx={{ mb: 4 }}>
                <CardHeader
                    title={
                        isEditing ? (
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        ) : (
                            <Typography variant="h5">{post.title}</Typography>
                        )
                    }

                    subheader={
                        <>
                            {post.author.id ? (
                                <Link component={RouterLink} to={`/profile/${post.author.id}`} underline="hover" color="primary">
                                    Автор: {post.author.username}
                                </Link>
                            ) : (
                                'Автор: Неизвестный'
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {formatDate(post.createdAt)}
                            </Typography>
                        </>
                    }

                    action={
                        isAuthor && (
                            <>
                                {isEditing ? (
                                    <>
                                        <Button onClick={handleSaveEdit} variant="contained" size="small" sx={{ mr: 1 }}>
                                            Сохранить
                                        </Button>
                                        <Button onClick={handleEditToggle} variant="outlined" size="small" color="inherit">
                                            Отмена
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={handleEditToggle} variant="outlined" size="small" sx={{ mr: 1 }}>
                                            Редактировать
                                        </Button>
                                        <IconButton onClick={handleDelete} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )}
                            </>
                        )
                    }
                />
                <CardContent>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            variant="outlined"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                    ) : (
                        <Typography variant="body1" color="text.primary">
                            {post.content}
                        </Typography>
                    )}
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <Typography sx={{ ml: 1 }}>{likes}</Typography>
                    <IconButton
                        onClick={handleLike}
                        disabled={hasLiked}
                        color={hasLiked ? 'error' : 'default'}
                        aria-label="like post"
                    >
                        <FavoriteIcon />
                    </IconButton>
                </Box>
            </Card>

            <Divider />
            <Typography variant="h6" gutterBottom>Комментарии</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>

                <TextField
                    label="Новый комментарий"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                        }
                    }}
                />
                <Button variant="contained" onClick={handleAddComment}>
                    Отправить
                </Button>
            </Box>
            <Box sx={{ mt: 4 }}>


                {comments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        Пока нет комментариев, будь первым!
                    </Typography>
                ) : (
                    <List>
                        {comments.map((comment) => (
                            <ListItem
                                key={comment.id}
                                alignItems="flex-start"
                                secondaryAction={
                                    myId === comment.author.id && (
                                        <IconButton
                                            edge="end"
                                            aria-label="delete comment"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={comment.author.avatarUrl || ""}
                                        alt={comment.author.username}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box>
                                            <Link
                                                component={RouterLink}
                                                to={`/profile/${comment.author.id}`}
                                                underline="hover"
                                                color="primary"
                                                sx={{ mr: 1 }}
                                            >
                                                {comment.author.username}
                                            </Link>
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 1 }}
                                            >
                                                {formatDate(comment.createdAt)}
                                            </Typography>
                                            {comment.author.id === post.author.id && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="secondary"
                                                    sx={{ fontWeight: 'bold', ml: 1 }}
                                                >
                                                    (автор)
                                                </Typography>
                                            )}
                                        </Box>
                                    }

                                    secondary={comment.content}
                                />

                            </ListItem>
                        ))}
                    </List>
                )}


            </Box>
        </Box>
    );
}
