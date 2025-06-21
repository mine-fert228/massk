import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ip, port } from "../assets/config.js";
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Button,
    Alert,
} from "@mui/material";
import request from "../api/funcapi.js";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query.trim()) {
            setPosts([]);
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        request(`http://${ip}:${port}/api/posts/search?query=${encodeURIComponent(query)}`,'GET')
            .then((res) => {
                if (!res.ok) throw new Error("Ошибка запроса");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setPosts(data);
                } else if (data.posts && Array.isArray(data.posts)) {
                    setPosts(data.posts);
                } else {
                    setPosts([]);
                    console.warn("Ожидался массив, получили:", data);
                }
            })
            .catch((err) => {
                setError(err.message || "Ошибка при загрузке данных");
                setPosts([]);
            })
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Результаты поиска: "{query}"
            </Typography>

            {loading && <Typography>Загрузка...</Typography>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && posts.length === 0 && <Typography>Ничего не найдено</Typography>}

            {posts.map((post) => (
                <Card key={post.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Avatar
                                src={post.author.avatarUrl || ""}
                                alt={post.author.username || "аватар"}
                            >
                                {!post.author.avatarUrl && post.author?.username?.[0]}
                            </Avatar>
                            <Typography variant="subtitle2" color="text.secondary">
                                {post.author.username || "Автор неизвестен"}
                            </Typography>
                        </Stack>
                        <Typography variant="h6" gutterBottom>
                            {post.title}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                            {post.content}
                        </Typography>

                        <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={`/post/${post.id}`}
                        >
                            Читать далее
                        </Button>

                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
