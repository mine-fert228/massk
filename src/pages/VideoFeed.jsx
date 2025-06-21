import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    TextField,
    CircularProgress, Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ip, port } from "../assets/config.js";
import request from "../api/funcapi.js";


const server = `http://${ip}:${port}`;

export default function VideoFeed() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const page = 1;
    const [pageSize] = useState(20); // если нужна настройка, можно сделать тоже state
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Загрузка видео с учетом поиска и пагинации
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    search,
                    page: page.toString(),
                    pageSize: pageSize.toString()
                }).toString();

                const res = await request(`${server}/api/Video/feed?${query}`,'GET');
                const json = await res.json();

                // Лучше, если сервер уже вернул только публичные видео,
                // но на всякий случай оставим фильтрацию:
                const publicVideos = json.filter(video => video.isPublic);
                setVideos(publicVideos);
            } catch (err) {
                console.error("Ошибка загрузки видео:", err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [search, page, pageSize]);

    const handleUploadClick = () => {
        navigate("/video/upload");
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <TextField
                    label="Поиск"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {token && (
                    <Button variant="contained" onClick={handleUploadClick}>
                        Загрузить видео
                    </Button>
                )}
            </Box>

            {loading ? (
                <Box textAlign="center" mt={4}><CircularProgress /></Box>
            ) : videos.length === 0 ? (
                <Typography>Нет видео для отображения.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {videos.map(video => (
                        <Grid item xs={12} sm={6} md={4} key={video.id}>
                            <Card onClick={() => navigate(`/video/${video.id}`)} sx={{ cursor: "pointer" }}>
                                <CardMedia
                                    component="img"
                                    image={`http://${ip}:${port}/previews/${video.previewName}` || `http://${ip}:${port}/previews/default.gif`}
                                    alt={video.title}
                                    sx={{
                                        width: 250,
                                        height: 140,
                                        objectFit: "cover",
                                        mx: "auto",
                                        borderRadius: 1
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                                        {video.title}
                                    </Typography>

                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" minWidth={0}>
                                            <Avatar
                                                src={video.author?.avatarUrl || ""}
                                                alt={video.author?.username || "Автор"}
                                                sx={{ width: 32, height: 32, mr: 1 }}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                                sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
                                            >
                                                {video.author?.username || "Автор неизвестен"}
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
