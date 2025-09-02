import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Context } from "../main";
import {
  privateRoutes,
  publicRoutes,
  RouteNames,
  type ProtectedRoute,
} from "../routes";

import "../assets/styles/pages.scss";

const AppRouter: React.FC = () => {
  const { store } = useContext(Context);
  const isAuth = store.isAuth;
  const userRole = store.user.role;

  const hasRoleAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
  };

  return (
    <Routes>
      {isAuth ? (
        <>
          {privateRoutes.map((route) => {
            const protectedRoute = route as ProtectedRoute;
            const Component = protectedRoute.element;
            return hasRoleAccess(protectedRoute.roles) ? (
              <Route
                key={protectedRoute.path}
                path={protectedRoute.path}
                element={<Component />}
              />
            ) : (
              <Route
                key={protectedRoute.path}
                path={protectedRoute.path}
                element={<Navigate to={RouteNames.PERSONAL} replace />}
              />
            );
          })}
          <Route path="*" element={<Navigate to={RouteNames.PERSONAL} replace />} />
        </>
      ) : (
        <>
          {publicRoutes.map((route) => {
            const Component = route.element;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          })}
          <Route path="*" element={<Navigate to={RouteNames.LOGIN} replace />} />
        </>
      )}
    </Routes>
  );
};

export default observer(AppRouter);
