import {validateSession} from "./auth.js";
import {ip, port} from "../assets/config.js";


export default async function request(endpoint, method, body) {
    const Token = localStorage.getItem('token');
    const res = await fetch(endpoint, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Token": Token
        },
        body: body || JSON.stringify(body), // ✅ Сюда вот это!
    });

    if (res.status === 401) {
        localStorage.setItem('session', false);
        localStorage.removeItem('token');
        validateSession();
    }

    if (res.status === 403) {
        window.location.replace("/error/403");
    }

    if (res.status === 404) {
        if (endpoint !== `${ip}:${port}/api/user/xox`) {
            window.location.replace("/error/404");
        }
    }

    return res;
}
