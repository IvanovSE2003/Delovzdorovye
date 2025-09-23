import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../models/Auth";
import Loader from "./UI/Loader/Loader";

interface ProtectedRouteProps {
  isAuth: boolean;
  role?: Role;
  allowedRoles?: Role[];
  children: JSX.Element;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuth,
  role,
  allowedRoles,
  children,
  redirectPath = "/login",
}) => {
  if (isAuth === undefined) return <Loader/>

  if (!isAuth) return <Navigate to={redirectPath} replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // запрещено видеть страницу
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
