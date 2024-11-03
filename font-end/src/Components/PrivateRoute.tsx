import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuthStatus, getUserId } from '../Utils/authentication';
import { LoadingOverlay } from '@mantine/core';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const authStatus = await checkAuthStatus();
            setIsAuthenticated(authStatus);
            if (authStatus) {
                const id = getUserId();
                setUserId(id);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <LoadingOverlay visible={true} />;
    }

    if (!isAuthenticated || !userId) {
        return <Navigate 
            to="/seller-login" 
            state={{ from: location.pathname }} 
            replace 
        />;
    }

    return <>{children}</>;
}
