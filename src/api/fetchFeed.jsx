import { ip, port } from '/src/assets/config.js';
import request from "./funcapi.js";

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

    const response = await request(`${BASE_URL}/feed?page=${page}&pageSize=${pageSize}`,'GET');

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
    const response = await request(`http://${ip}:${port}/api/posts/${id}`,'GET');
    if (!response.ok) {
        throw new Error("Не удалось загрузить пост");
    }
    return await response.json();
}


export const deletePost = async (postId) => {

    const response = await request(`http://${ip}:${port}/api/posts/${postId}`,'DELETE',);
    return response.json();
};

export const updatePost = async (postId, updatedData) => {

    const response = await request(`http://${ip}:${port}/api/posts/${postId}`,'PUT',JSON.stringify(updatedData));
    return response.json();
};

