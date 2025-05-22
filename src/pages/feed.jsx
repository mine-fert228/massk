import React, { useEffect, useState, useCallback } from "react";
import { fetchFeed } from "../api/fetchFeed";
import { useAuthGuard } from "../components/LoginValid.jsx";
import Post from "../components/Post";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Feed() {
    useAuthGuard();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const navigate = useNavigate();

    const loadPosts = useCallback(async () => {
        try {
            const result = await fetchFeed(page, 10);
            const newPosts = Array.isArray(result) ? result : result.posts || [];
            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(newPosts.length === 10);
            if (newPosts.length === 10) setPage(prev => prev + 1);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }, [page]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
            <Box sx={{ mb: 3, textAlign: "right" }}>
                <Button variant="contained" color="primary" onClick={() => navigate('/post/upload')}>
                    Создать новый пост
                </Button>
            </Box>

            {posts.length > 0 ? (
                    posts.map(post => {
                        // Создаем превью контента (100 символов + "...")
                        const excerpt = post.content.length > 100
                            ? post.content.slice(0, 100) + "..."
                            : post.content;

                        return (
                            <Post
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                author={post.author}
                                excerpt={excerpt} // передаем короткий текст
                            />
                        );
                    })
                ) : (
                    <p>Загружаются посты...</p>
                )}

            {hasMore && <div style={{ height: 100 }} />}
        </Box>
    );
}
