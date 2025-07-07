import {ip,port} from "../assets/config.js"
import request from "./funcapi.js";

const API_BASE = `${ip}:${port}/api/account`;


export async function login(login, password) {
    const res = await request(`${API_BASE}/login`, 'POST', JSON.stringify({ login, password }));



    const resjs = await res.json();


    if (resjs.message === 'TwoFactorRequired') {
        return { twoFactorRequired: true, twoFactorToken: resjs.data };
    }
    if (resjs.success == false) {

        throw new Error(resjs.message.toString() || 'Ошибка входа');
    }
    const token = resjs.data;
    localStorage.setItem('token', token);
    localStorage.setItem('2fa',false)
    localStorage.setItem('session', true);
    return { token };
}

export async function verify2fa(twoFactorToken, code) {
    const res = await request(
        `${API_BASE}/complete-2fa`,
        'POST',
        JSON.stringify({ twoFactorToken, code }),
        { 'Content-Type': 'application/json' }
    );
    const resjs = await res.json();
    if (resjs.success == false) {
        const text = await resjs.message.toString();
        throw new Error(text || 'Ошибка подтверждения');
    }

    localStorage.setItem('2fa',true)
    const token = resjs.data;

    // сохраняем основной токен после 2FA
    localStorage.setItem('token', token);

    return { success: true };
}

export async function register(login, password) {
    const res = await request(`${API_BASE}/register`,'POST',JSON.stringify({ login, password }));

    if (!res.ok) {
        if (res.status === 409) throw new Error('Пользователь уже существует');
        throw new Error('Ошибка регистрации');
    }
    localStorage.setItem('2fa',false)
    const token = await res.text();
    localStorage.setItem('token', token);
    return { token };
}




export async function validateSession() {

    if(localStorage.getItem('session') === null){
        localStorage.setItem('session', false);

    }
    if(localStorage.getItem('session') === false){
        window.location.href = '/login';
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

    return rawToken?.split(":")[0] || "xox";
}

