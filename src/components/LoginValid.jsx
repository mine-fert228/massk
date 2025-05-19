import { useEffect } from 'react';
import { validateSession } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuthGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const valid = await validateSession();
            if (!valid) navigate('/login');
        })();
    }, [navigate]);
}
