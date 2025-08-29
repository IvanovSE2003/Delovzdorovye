import { RouteNames } from ".";
import type { AppRoute } from "../models/IRoute";

import Account from "../pages/account/Account";
import Bell from "../pages/account/Bell";
import LoginPage from "../pages/auth/index";
import HomePage from "../pages/Homepage";
import SomeProfile from "../pages/account/SomeProfile";

import Finance from "../pages/account/doctor/Finance";
import Help from "../pages/account/doctor/Help";
import TimeSheet from "../pages/account/doctor/TimeSheet/TimeSheet";
import ConsultationsDoc from "../pages/account/doctor/Consultations";

import MainPat from "../pages/account/patient/Main";
import ConsultationsPat from '../pages/account/patient/Consultations'
import UsefulInfo from "../pages/account/patient/UsefulInfo";
import Recomendations from "../pages/account/patient/Recomendations";
import SpecialistsPat from "../pages/account/patient/Specialists";


import Users from "../pages/account/admin/Users";
import SpecialistsAdm from "../pages/account/admin/Specialists";

export const appRoutes: AppRoute[] = [
    // Публичные
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.LOGIN, element: LoginPage },
    { path: RouteNames.PROFILE, element: SomeProfile },

    // Приватные (общие)
    { path: RouteNames.PERSONAL, element: Account, isPrivate: true },
    { path: RouteNames.BELL, element: Bell, isPrivate: true },

    // Пациенты
    { path: RouteNames.MAINPAT, element: MainPat, roles: ['PATIENT'], isPrivate: true },
    { path: RouteNames.CONSULTATIONSPAT, element: ConsultationsPat, roles: ['PATIENT'], isPrivate: true },
    { path: RouteNames.RECOMENDATIONS, element: Recomendations, roles: ['PATIENT'], isPrivate: true },
    { path: RouteNames.USEFULINFO, element: UsefulInfo, roles: ['PATIENT', 'DOCTOR'], isPrivate: true },
    { path: RouteNames.SPECIALISTPAT, element: SpecialistsPat, roles: ['PATIENT'], isPrivate: true },

    // Доктора
    { path: RouteNames.CONSULTATIONSDOC, element: ConsultationsDoc, roles: ['DOCTOR'], isPrivate: true },
    { path: RouteNames.TIMESHEET, element: TimeSheet, roles: ['DOCTOR'], isPrivate: true },
    { path: RouteNames.HELP, element: Help, roles: ['DOCTOR'], isPrivate: true },
    { path: RouteNames.FINANCE, element: Finance, roles: ['DOCTOR'], isPrivate: true },

    // Админ
    { path: RouteNames.SPECIALISTS, element: SpecialistsAdm, roles: ['ADMIN'], isPrivate: true },
    { path: RouteNames.USERS, element: Users, roles: ['ADMIN'], isPrivate: true },
];
export { RouteNames };

export const menuConfig: Record<string, { path: string; name: string }[]> = {
    PATIENT: [
        { path: RouteNames.MAINPAT, name: "Главная" },
        { path: RouteNames.CONSULTATIONSPAT, name: "Консультации" },
        { path: RouteNames.RECOMENDATIONS, name: "Рекомендации" },
        { path: RouteNames.SPECIALISTPAT, name: "Специалисты" },
        { path: RouteNames.USEFULINFO, name: "Полезная информация" },
    ],
    DOCTOR: [
        { path: RouteNames.MAIN, name: "Главная" },
        { path: RouteNames.CONSULTATIONSDOC, name: "Консультации" },
        { path: RouteNames.TIMESHEET, name: "Расписание" },
        { path: RouteNames.HELP, name: "Коллегиальная помощь" },
        { path: RouteNames.FINANCE, name: "Финансы" },
        { path: RouteNames.USEFULINFO, name: "Полезная информация" },
    ],
    ADMIN: [
        { path: RouteNames.MAIN, name: "Главная" },
        { path: RouteNames.SPECIALISTS, name: "Специалисты" },
        { path: RouteNames.USERS, name: "Пользователи" },
    ],
};


