
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser } from '../services/user_service';
import { UnexistingSessionUserError } from '../types/Errors';

function ProtectedRoute() {
    const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null);

    useEffect(() => {
        async function checkUser() {
            try {
                const user = await getSessionUser();
                console.log("User in session:", user);
                if(!user || !user.username) throw new UnexistingSessionUserError();
                setIsLoggedIn(true);
            } catch (error) {
                localStorage.removeItem('jwt-token');
                setIsLoggedIn(false);
            }
        }
        checkUser();
    }, []);

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }
    if (!isLoggedIn) {
        localStorage.setItem('redirectUrl', window.location.pathname);
        return <Navigate to="/auth" />;
    } else {
        return <Outlet />;
    }
}

export default ProtectedRoute;
