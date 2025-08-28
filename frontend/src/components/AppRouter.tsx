import { Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Context } from "../main";
import { appRoutes, RouteNames } from "../routes/config";

const AppRouter: React.FC = () => {
  const { store } = useContext(Context);
  const { isAuth, user } = store;

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(user.role);
  };

  return (
    <Routes>
      {appRoutes.map((route) => {
        if (route.isPrivate && !isAuth) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Navigate to={RouteNames.LOGIN} replace />}
            />
          );
        }

        if (route.roles && !hasAccess(route.roles)) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Navigate to={RouteNames.PERSONAL} replace />}
            />
          );
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            element={<route.element />}
          />
        );
      })}

      {/* 404 */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuth ? RouteNames.PERSONAL : RouteNames.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
};

export default observer(AppRouter);
