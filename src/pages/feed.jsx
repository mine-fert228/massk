import React, { useEffect, useState, useCallback } from "react";
import { fetchFeed } from "../api/fetchFeed";

import Post from "../components/Post";
import {
    Button,
    Box,
    TextField,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

export default function Feed() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = () => {
        const query = searchInput.trim();
        if (query) {
            navigate(`/search?query=${encodeURIComponent(query)}`);
            setSearchInput("");
        }
    };

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

            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", gap: 2 }}>
                <TextField
                    size="small"
                    placeholder="Поиск..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    sx={{ bgcolor: "white", borderRadius: 1, flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/post/upload')}
                >
                    Создать новый пост
                </Button>
            </Box>




            {posts.length > 0 ? (
                posts.map(post => {
                    const excerpt = post.content.length > 100
                        ? post.content.slice(0, 100) + "..."
                        : post.content;

                    return (
                        <Post
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            author={post.author}
                            excerpt={excerpt}
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
