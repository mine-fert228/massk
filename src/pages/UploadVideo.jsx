import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ip, port } from "../assets/config.js";

const server = `http://${ip}:${port}`;

export default function UploadVideo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [videoFile, setVideoFile] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const handleSubmit = async () => {
        if (!videoFile || !title.trim()) {
            setError("Видео и заголовок обязательны");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("title", title);
        formData.append("isPublic", isPublic); // boolean, бекенд должен уметь принять
        formData.append("description", description);
        if (previewFile) formData.append("preview", previewFile);

        try {
            const res = await fetch(`${server}/api/Video/upload`, {
                method: "POST",
                headers: {
                    Token: token,
                },
                body: formData,
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
            if (!res.ok) throw new Error("Ошибка загрузки");

            setSuccess(true);
            setTimeout(() => navigate("/video/feed"), 1500); // после успеха редирект
        } catch {
            setError("Не удалось загрузить видео.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
            <Typography variant="h4" mb={3}>
                Загрузка видео
            </Typography>

            <TextField
                fullWidth
                label="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                multiline
                rows={4}
                label="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                    />
                }
                label="публичный доступ"
            />

            <Typography variant="body1">Выберите видео:</Typography>
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                style={{ marginBottom: 16 }}
            />

            <Typography variant="body1">Выберите превью:</Typography>
            <input
                type="file"
                accept=".jpg,.svg,.png,.gif,.webp"
                onChange={(e) => setPreviewFile(e.target.files[0])}
                style={{ marginBottom: 24 }}
            />

            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !token}
                fullWidth
            >
                {loading ? <CircularProgress size={24} /> : "Загрузить"}
            </Button>

            <Snackbar
                open={!!error}
                onClose={() => setError("")}
                message={error}
                autoHideDuration={4000}
            />
            <Snackbar
                open={success}
                onClose={() => setSuccess(false)}
                message="Видео успешно загружено!"
                autoHideDuration={3000}
            />
        </Box>
    );
}
