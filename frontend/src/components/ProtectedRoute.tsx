import { Navigate } from "react-router";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
    isAuth: boolean;
    children: ReactNode;
}

export default function ProtectedRoute({ isAuth, children }: ProtectedRouteProps) {
    console.log(isAuth)

    if (isAuth) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}