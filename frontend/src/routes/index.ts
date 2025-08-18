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

import Specialists from "../pages/account/admin/Specialists";
import Users from '../pages/account/admin/Users';

export interface IRoute {
    path: string;
    element: React.ReactNode;
}

export type ProtectedRoute = {
    path: string;
    element: React.ComponentType;
    roles?: string[];
};

export const RouteNames = {
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/pinCode-reset/:token',
    USEFULINFO: '/usefulinfo',

    CONSULTATIONSPAT: '/patient/consultations',
    RECOMENDATIONS: '/patient/recomendations',

    CONSULTATIONSDOC: '/doctor/consultations',
    TIMESHEET: '/doctor/timesheet',
    HELP: '/doctor/help',
    FINANCE: '/doctor/finance',

    SPECIALISTS: '/admin/specialists',
    USERS: '/admin/users',
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

export const menuItemsAdmin = [
    { path: RouteNames.MAIN, name: 'Главная'},
    { path: RouteNames.SPECIALISTS, name: 'Специалисты'},
    { path: RouteNames.USERS, name: 'Пользователи'}
]

export const publicRoutes = [
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.LOGIN, element: LoginPage },
    { path: RouteNames.RESET, element: RecoverPinPage },
]

export const privateRoutes: ProtectedRoute[] = [
    // Общие маршруты для всех авторизованных
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.PERSONAL, element: Account },
    
    // Маршруты для пациентов
    { path: RouteNames.CONSULTATIONSPAT, element: ConsultationsPat, roles: ['PATIENT'] },
    { path: RouteNames.RECOMENDATIONS, element: Recomendations, roles: ['PATIENT'] },
    { path: RouteNames.USEFULINFO, element: UsefulInfo, roles: ['PATIENT', 'DOCTOR'] },
    
    // Маршруты для врачей
    { path: RouteNames.CONSULTATIONSDOC, element: ConsultationsDoc, roles: ['DOCTOR'] },
    { path: RouteNames.TIMESHEET, element: TimeSheet, roles: ['DOCTOR'] },
    { path: RouteNames.HELP, element: Help, roles: ['DOCTOR'] },
    { path: RouteNames.FINANCE, element: Finance, roles: ['DOCTOR'] },
    
    // Маршруты для администраторов
    { path: RouteNames.SPECIALISTS, element: Specialists, roles: ['ADMIN'] },
    { path: RouteNames.USERS, element: Users, roles: ['ADMIN'] },
];