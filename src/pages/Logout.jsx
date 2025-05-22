import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logout from '../api/auth.js';

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        logout().then(() => {
            navigate('/post/feed');
        });
    }, []);

    return (
        <div style={{ maxWidth: 300, margin: 'auto', padding: 20 }}>
            <h2>Выход...</h2>
        </div>
    );
}
