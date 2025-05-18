import { ip, port } from '/src/assets/config.js';
const API_BASE = `http://${ip}:${port}`;


export async function getUserById(id) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/account/user/${id}`, {
        headers: {
            "Content-Type": "application/json",
            "Token": token
        }
    });

    if (!res.ok) {
        throw new Error("Не удалось получить пользователя");
    }

    return await res.json();
}

