import type React from "react";
import LoginPage from '../pages/LoginPage'
import HomePage from "../pages/HomePage";
import RecoverPassPage from "../pages/RecoverPassPage"
import PersonalAccountPage from "../pages/PersonalAccountPage";

export interface IRoute {
    path: string;
    element: React.ReactNode;
}

export const RouteNames = {
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/password-reset/:token'
} as const;

export const publicRoutes = [
    {path: RouteNames.LOGIN, element: LoginPage},
    {path: RouteNames.MAIN, element: HomePage}
]

export const privateRoutes = [
    {path: RouteNames.PERSONAL, element: PersonalAccountPage},
    {path: RouteNames.RESET, element: RecoverPassPage},
    {path: RouteNames.MAIN, element: HomePage}
]