import { ip, port } from '/src/assets/config.js';

const BASE_URL = `http://${ip}:${port}/api/posts`;

/**
 * Загружает ленту постов с пагинацией
 * @param {number} page - номер страницы (по умолчанию 1)
 * @param {number} pageSize - размер страницы (по умолчанию 10)
 * @returns {Promise<Array>} - массив постов
 */
export async function fetchFeed(page = 1, pageSize = 10) {
    const token = localStorage.getItem('token');
    console.log("Fetching feed with token:", token, "Page:", page, "Page size:", pageSize);

    const response = await fetch(`${BASE_URL}/feed?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Token': token
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка при загрузке ленты: ${response.status}`);
    }

    const result = await response.json();
    console.log("Fetch response:", result);
    return result;
}
// src/api/fetchFeed.js



// Функция для загрузки поста по id
export async function fetchPost(id) {
    const response = await fetch(`http://${ip}:${port}/api/posts/${id}`);
    if (!response.ok) {
        throw new Error("Не удалось загрузить пост");
    }
    return await response.json();
}


export const deletePost = async (postId) => {
    const token = localStorage.getItem("sessionToken"); // Получаем токен сессии
    const response = await fetch(`http://${ip}:${port}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Token': token, // Передаем токен в заголовке
        },
    });
    return response.json();
};

export const updatePost = async (postId, updatedData) => {
    const token = localStorage.getItem("sessionToken");
    const response = await fetch(`http://${ip}:${port}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Token': token,
        },
        body: JSON.stringify(updatedData),
    });
    return response.json();
};

