import React, { useEffect, useState, useCallback } from "react";
import { fetchFeed } from "../api/fetchFeed";
import { useAuthGuard} from "../components/LoginValid.jsx";
import Post from "../components/Post"; // Импортируем компонент Post

export default function Feed() {
    useAuthGuard();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Функция для загрузки постов с пагинацией
    const loadPosts = useCallback(async () => {
        try {
            const result = await fetchFeed(page, 10);
            console.log("Fetched posts:", result); // Логируем результат

            const newPosts = Array.isArray(result) ? result : [result]; // Если пришел один объект, делаем его массивом
            console.log("New posts to display:", newPosts); // Логируем новый список постов

            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(newPosts.length === 10);
            if (newPosts.length === 10) setPage(prev => prev + 1); // Увеличиваем страницу, если постов достаточно
        } catch (error) {
            console.error("Error fetching posts:", error); // Логируем ошибки
        }
    }, [page]);

    // Загружаем посты при монтировании компонента
    useEffect(() => {
        loadPosts();
    }, [loadPosts]); // Указываем loadPosts как зависимость для перезапуска при изменении

    return (
        <div>

            {posts.length > 0 ? (
                posts.map(post => (
                    <Post


                        title={post.title}


                        id={post.id}
                    />
                ))
            ) : (
                <p>Загружаются посты...</p>
            )}

            {/* Показываем блок для прокрутки, если есть еще посты */}
            {hasMore && <div style={{ height: 100 }} />}

        </div>
    );
}
