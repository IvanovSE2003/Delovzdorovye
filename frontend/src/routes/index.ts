import type React from "react";
import LoginPage from '../pages/auth/LoginPage'
import HomePage from "../pages/HomePage";
import RecoverPinPage from "../pages/auth/RecoverPinPage"
import Account from "../pages/account/Account";
import ConsultationsPat from "../pages/account/patient/Consultations";
import Recomendations from "../pages/account/patient/Recomendations";
import UsefulInfo from "../pages/account/patient/UsefulInfo";

import ConsultationsDoc from "../pages/account/doctor/Consultations";
import TimeSheet from "../pages/account/doctor/TimeSheet";
import Help from "../pages/account/doctor/Help";
import Finance from "../pages/account/doctor/Finance";

export interface IRoute {
    path: string;
    element: React.ReactNode;
}

export const RouteNames = {
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/pinCode-reset/:token',
    CONSULTATIONSPAT: '/patient/consultations',
    CONSULTATIONSDOC: '/doctor/consultations',
    TIMESHEET: '/doctor/timesheet',
    HELP: '/doctor/help',
    FINANCE: '/doctor/finance',
    RECOMENDATIONS: '/recomendations',
    USEFULINFO: '/usefulinfo'
} as const;

export const menuItemsPatient = [
    { path: RouteNames.MAIN, name: 'Главная' },
    { path: RouteNames.CONSULTATIONSPAT, name: 'Консультации' },
    { path: RouteNames.RECOMENDATIONS, name: 'Рекомендации' },
    { path: RouteNames.USEFULINFO, name: 'Полезная информация' }
];

export const menuItemsDoctor = [
    { path: RouteNames.MAIN, name: 'Главная' },
    { path: RouteNames.CONSULTATIONSDOC, name: 'Консультации'},
    { path: RouteNames.TIMESHEET, name: 'Расписание'},
    { path: RouteNames.HELP, name: 'Коллегиальная помощь'},
    { path: RouteNames.FINANCE, name: 'Финансы'},
    { path: RouteNames.USEFULINFO, name: 'Полезная информация'},
]

export const publicRoutes = [
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.LOGIN, element: LoginPage },
    { path: RouteNames.RESET, element: RecoverPinPage },
]

export const privateRoutes = [
    { path: RouteNames.PERSONAL, element: Account },
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.CONSULTATIONSPAT, element: ConsultationsPat},
    { path: RouteNames.RECOMENDATIONS, element: Recomendations },
    { path: RouteNames.USEFULINFO, element: UsefulInfo },
    { path: RouteNames.CONSULTATIONSDOC, element: ConsultationsDoc},
    { path: RouteNames.TIMESHEET, element: TimeSheet},
    { path: RouteNames.HELP, element: Help},
    { path: RouteNames.FINANCE, element: Finance},
]