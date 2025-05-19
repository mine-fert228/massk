import { ip, port } from '../assets/config.js';
const API_BASE = `http://${ip}:${port}/api/account`;


export async function login(login, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password  }),
    });

    if (!res.ok) {
        throw new Error(res.status === 401 ? 'Неверный логин или пароль' : 'Ошибка входа');
    }

    const token = await res.text();
    localStorage.setItem('token', token);
    return { token };
}

export async function register(login, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
    });

    if (!res.ok) {
        if (res.status === 409) throw new Error('Пользователь уже существует');
        throw new Error('Ошибка регистрации');
    }

    const token = await res.text();
    localStorage.setItem('token', token);
    return { token };
}

export async function validateSession() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const res = await fetch(`${API_BASE}/validate-session`, {
        headers: { Token: token },
    });
    if(!res.ok) {logout();}
    return res.ok;
}

export default async function logout() {
    console.log("Logout вызван");
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/logout`, {
       method: 'POST',
        headers: {
            'Token': token,
        },
    });
    localStorage.removeItem('token');
}

// Получаем ID пользователя по токену из localStorage
export async function getMyId() {

    const token = localStorage.getItem("token"); // Получаем токен из localStorage

    if (!token) {
        return "knox";
    }
    try{
        const response = await fetch(`http://${ip}:${port}/api/user/GetMyId`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Token": token // Отправляем токен в заголовке
            }
        });
        const rawId = await response.json();
        const cleanId = rawId.replace(/^["'()]+|["'()]+$/g, "");

        if (!response.ok) {

            throw new Error("Ошибка при получении ID пользователя");
        }


        // Ответ не является JSON, а просто ID в виде строки
        return await cleanId; // Получаем строку (ID)
    }
    catch{

        return "knox";
    }

}
