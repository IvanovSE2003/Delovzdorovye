import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Context } from "../main";
import { privateRoutes, publicRoutes, RouteNames } from "../routes";

const AppRouter: React.FC = () => {
    const { store } = useContext(Context);
    const isAuth = store.isAuth;
    return (
        <Routes>
            {isAuth ? (
                <>
                    {privateRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<route.element />}
                        />
                    ))}
                    <Route path="*" element={<Navigate to={RouteNames.MAIN} replace />} />
                </>
            ) : (
                <>
                    {publicRoutes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<route.element />}
                        />
                    ))}
                    <Route path="*" element={<Navigate to={RouteNames.PERSONAL} replace />} />
                </>
            )}
        </Routes>
    );
};

export default observer(AppRouter);