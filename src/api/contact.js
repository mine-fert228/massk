import { ip, port } from '/src/assets/config.js';
import request from "./funcapi.js";

export async function fetchContacts() {
    const token = localStorage.getItem("token");

    const friendRes = await request(`http://${ip}:${port}/api/friends/list`,'GET');

    if (!friendRes.ok) {
        throw new Error("Пользователь не найден или нет доступа");
    }

    const friendsData = await friendRes.json();

    return friendsData.filter(Boolean).map(f => ({
        id: f.friendId,
        name: f.friendProfile.name,
        avatarUrl: f.friendProfile.avatarUrl
    }));
}
