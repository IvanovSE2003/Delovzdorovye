import { Navigate } from "react-router";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
    isAuth: boolean;
    children: ReactNode;
}

function AuthProtectedRoute({ isAuth, children }: ProtectedRouteProps) {
    if (isAuth) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

export default AuthProtectedRoute;