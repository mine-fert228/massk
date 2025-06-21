import {ip,port} from "../assets/config.js"
import request from "./funcapi.js";
const API_BASE = `http://${ip}:${port}/api/account`;


export async function login(login, password) {
    const res = await request(`${API_BASE}/login`,'POST',JSON.stringify({ login, password  }));
    console.log(ip);
    if (!res.ok) {
        if(!res.text() == ""){

                throw new Error(res.status === 400 ? `${res.text()}` : 'Ошибка входа');

        }
        throw new Error(res.status === 401 ? 'Неверный логин или пароль' : 'Ошибка входа');
    }

    const token = await res.text();
    localStorage.setItem('token', token);
    return { token };
}

export async function register(login, password) {
    const res = await request(`${API_BASE}/register`,'POST',JSON.stringify({ login, password }));

    if (!res.ok) {
        if (res.status === 409) throw new Error('Пользователь уже существует');
        throw new Error('Ошибка регистрации');
    }

    const token = await res.text();
    localStorage.setItem('token', token);
    return { token };
}




export async function validateSession() {
    if(localStorage.getItem('session') === null){
        localStorage.setItem('session', false);

    }
    if(localStorage.getItem('token') !== null){
        localStorage.setItem('session', true);
    }
    return localStorage.getItem('session');
}




export default async function logout() {
    console.log("Logout вызван");

    await request(`${API_BASE}/logout`,'POST');
    localStorage.setItem('session', false);
    localStorage.removeItem('token');
}

// Получаем ID пользователя по токену из localStorage
export function getMyId() {
    const rawToken = localStorage.getItem("token");

    return rawToken?.split(":")[0] || "knox";
}

