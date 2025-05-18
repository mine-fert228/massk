import { Box, Typography, Container, Paper, Grid, Button } from "@mui/material";
import React from 'react';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';

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

function VideoTitle({ title }) {
    return (
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#000', textAlign: 'center' }}>
            {title}
        </Typography>
    );
}

function VideoPlayer({ url }) {
    return (
        <Box sx={{ aspectRatio: "16/9", position: "relative", overflow: "hidden", borderRadius: 2 }}>
            <ReactPlayer
                url={url}
                controls
                playing={false}
                width="100%"
                height="100%"
                style={{
                    borderRadius: '8px',
                }}
            />
        </Box>
    );
}

function VideoDescription({ description,id }) {
    return (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="body1" sx={{ color: '#555' }}>
                {description}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Link to={`/video/${id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ width: '100%' }}>
                        Смотреть видео
                    </Button>
                </Link>
            </Box>
        </Box>
    );
}

export default function VideoList() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {videoData.map((video) => (
                    <Grid item xs={12} md={4} key={video.id}>
                        <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
                            <VideoTitle title={video.title} />
                            <VideoPlayer url={video.url} />
                            <VideoDescription description={video.description} id={video.id} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
