import type React from "react";
import LoginPage from '../pages/LoginPage'
import HomePage from "../pages/HomePage";
import RecoverPassPage from "../pages/RecoverPinPage"
import Account from "../pages/Account";

export interface IRoute {
    path: string;
    element: React.ReactNode;
}

export const RouteNames = {
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/pinCode-reset/:token'
} as const;

export const publicRoutes = [
    {path: RouteNames.MAIN, element: HomePage},
    {path: RouteNames.LOGIN, element: LoginPage},
    {path: RouteNames.RESET, element: RecoverPassPage},
]

export const privateRoutes = [
    {path: RouteNames.PERSONAL, element: Account},
    {path: RouteNames.MAIN, element: HomePage}
]