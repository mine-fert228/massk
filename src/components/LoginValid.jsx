import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthGuard(location) {
    const navigate = useNavigate();

    useEffect(() => {

        const publicRoutes = ["/login", "/register", "/error/403", "/error/404"];
        const isPublic = publicRoutes.includes(location.pathname);
        if (!isPublic) {
            const token = localStorage.getItem("token");
            if (!token){
                localStorage.setItem('session', false);
                navigate("/login");
            }
            localStorage.setItem('session', true);
        }
    }, [location.pathname]);
}

