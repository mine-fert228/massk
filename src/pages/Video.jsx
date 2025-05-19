import { Box, Typography, Container, Paper, Button } from "@mui/material";
import React from 'react';
import ReactPlayer from 'react-player';
import { useParams, Link } from 'react-router-dom';

const videoData = [
    {
        id: 1,
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        title: "Big Buck Bunny",
        description: "Забавное видео о большом кролике, который мстит своим обидчикам.",
    },
    {
        id: 2,
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        title: "Elephant's Dream",
        description: "Это первый фильм с открытым исходным кодом, снятый с использованием технологий компьютерной анимации.",
    },
    {
        id: 3,
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        title: "For Bigger Fun",
        description: "Веселое и динамичное видео для хорошего настроения!",
    }
];

export default function SingleVideoPage() {
    const { id } = useParams(); // Получаем id видео из параметров URL
    const video = videoData.find((video) => video.id === parseInt(id));

    if (!video) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5">Видео не найдено</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#000', textAlign: 'center' }}>
                    {video.title}
                </Typography>
                <Box sx={{ aspectRatio: "16/9", position: "relative", overflow: "hidden", borderRadius: 2 }}>
                    <ReactPlayer
                        url={video.url}
                        controls
                        playing={false}
                        width="100%"
                        height="100%"
                        style={{
                            borderRadius: '8px',
                        }}
                    />
                </Box>
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
                    <Typography variant="body1" sx={{ color: '#555' }}>
                        {video.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Link to="/video" style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="primary" sx={{ width: '100%' }}>
                                Вернуться к видео списку
                            </Button>
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
