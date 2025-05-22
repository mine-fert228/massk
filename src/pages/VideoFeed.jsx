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
    CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ip, port } from "../assets/config.js";
import {useAuthGuard} from "../components/LoginValid.jsx";
const server = `http://${ip}:${port}`;

export default function VideoFeed() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    useAuthGuard();
    // Загрузка видео
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch(`${server}/api/Video/feed`);
                const json = await res.json();
                // Фильтрация только публичных видео
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
    }, []);


    const handleUploadClick = () => {
        navigate("/video/upload");
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>

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
                                    image={`http://${ip}:${port}/previews/${video.previewName}` || `http://${ip}:${port}/previews/default.jpg`}
                                    alt={video.title}
                                    sx={{
                                        width: 250,          // фиксированная ширина
                                        height: 140,         // фиксированная высота
                                        objectFit: "cover",  // обрезает, но заполняет всё (для превью — самое то)
                                        mx: "auto",          // по центру
                                        borderRadius: 1      // опционально — скругление
                                    }}
                                />


                                <CardContent>
                                    <Typography variant="h6" noWrap>{video.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {video.author?.username || "Автор неизвестен"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(video.createdAt).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
