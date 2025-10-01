import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Context } from "../main";
import {
  defaultRoleRoutes,
  privateRoutes,
  publicRoutes,
  RouteNames,
  type ProtectedRoute,
} from "../routes";

const LastVisitedTracker: React.FC = () => {
  const location = useLocation();
  const { store } = useContext(Context);

  useEffect(() => {
    if (location.pathname !== RouteNames.LOGIN) {
      // если путь не из списка роутов, не сохраняем
      const allPaths = [...privateRoutes, ...publicRoutes].map(r => r.path);
      if (allPaths.includes(location.pathname)) {
        store.setLastVisited(location.pathname);
        localStorage.setItem("lastVisited", location.pathname);
      }
    }
  }, [location.pathname, store]);

  return null;
};

const AppRouter: React.FC = () => {
  const { store } = useContext(Context);
  const isAuth = store.isAuth;
  const userRole = store.user.role;

  const hasRoleAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
  };

  const lastVisited =
    store.lastVisited || localStorage.getItem("lastVisited");

  const defaultForRole =
    (userRole && defaultRoleRoutes[userRole]) || RouteNames.PERSONAL;

  const availablePaths = privateRoutes
    .filter((r) => hasRoleAccess((r as ProtectedRoute).roles))
    .map((r) => r.path);

  const safeStartPage =
    lastVisited && availablePaths.includes(lastVisited)
      ? lastVisited
      : defaultForRole;

  return (
    <>
      <LastVisitedTracker />
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
                  element={<Navigate to={defaultForRole} />}
                />
              );
            })}
            <Route path="*" element={<Navigate to={safeStartPage} />} />
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
            <Route path="*" element={<Navigate to={RouteNames.LOGIN} />} />
          </>
        )}
      </Routes>
    </>
  );
};


export default observer(AppRouter);
