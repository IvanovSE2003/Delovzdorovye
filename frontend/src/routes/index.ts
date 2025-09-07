import type React from "react";
import LoginPage from '../pages/auth/index'
import HomePage from "../pages/Homepage";
import Account from "../pages/account/Account";

import UsefulInfoPat from "../pages/account/patient/UsefulInfo";
import ConsultationsPat from "../pages/account/patient/Consultations";
import Recomendations from "../pages/account/patient/Recomendations";
import MainPat from "../pages/account/patient/Main";
import SpecialistsPat from "../pages/account/patient/Specialists/Specialists";

import ConsultationsDoc from "../pages/account/doctor/Consultations/Consultations";
import TimeSheet from "../pages/account/doctor/TimeSheet/TimeSheet";
import UsefulInfoDoc from "../pages/account/doctor/UsefulInfo";

import Specialists from "../pages/account/admin/Specialists";
import Users from '../pages/account/admin/Users';

import Profile from "../pages/account/SomeProfile";
import Bell from "../pages/account/Bell";
import MakeConsultation from "../pages/account/admin/MakeConsultation/MakeConsultation";
import ArchiveConsultations from "../pages/account/admin/ArchiveConsultations/ArchiveConsultations";
import EditUsefulInformations from "../pages/account/admin/EditUsefulInformations/EditUsefulInformations";

export interface IRoute {
    path: string;
    element: React.ReactNode;
}

export interface ProtectedRoute {
  path: string;
  element: React.FC;
  roles?: string[];
}

export const RouteNames = {
    // Общие пути
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/pinCode-reset/:token',
    PROFILE: '/profile/:id',
    BELL: '/notifications',

    // Пути для пациента
    CONSULTATIONSPAT: '/patient/consultations',
    RECOMENDATIONS: '/patient/recomendations',
    SPECIALISTPAT: '/patient/specialist',
    USEFULINFOPAT: '/patient/useful-information',
    MAINPAT: '/patient/main',

    // Пути для доктора
    CONSULTATIONSDOC: '/doctor/consultations',
    TIMESHEET: '/doctor/timesheet',
    USEFULINFODOC: '/doctor/useful-information',

    // Пути для админа
    USERS: '/admin/users',
    SPECIALISTS: '/admin/specialists',
    MAKECONSULTATION: '/admin/make-consultation',
    ARCHIVECONSULTATIONS: '/admin/archive-consultation',
    EDITUSEFULINFO: '/admin/edit-useful-information',
} as const;

export const menuConfig: Record<string, { path: string; name: string }[]> = {
    PATIENT: [
        { path: RouteNames.MAINPAT, name: "Главная" },
        { path: RouteNames.CONSULTATIONSPAT, name: "Консультации" },
        { path: RouteNames.RECOMENDATIONS, name: "Рекомендации" },
        { path: RouteNames.SPECIALISTPAT, name: "Специалисты" },
        { path: RouteNames.USEFULINFOPAT, name: "Полезная информация" },
    ],
    DOCTOR: [
        { path: RouteNames.CONSULTATIONSDOC, name: "Консультации" },
        { path: RouteNames.TIMESHEET, name: "Расписание" },
        { path: RouteNames.USEFULINFODOC, name: "Полезная информация" },
    ],
    ADMIN: [
        { path: RouteNames.USERS, name: "Пользователи" },
        { path: RouteNames.SPECIALISTS, name: "Специалисты" },
        { path: RouteNames.MAKECONSULTATION, name: "Запись на консультацию" },
        { path: RouteNames.ARCHIVECONSULTATIONS, name: 'Архив консультаций'},
        { path: RouteNames.EDITUSEFULINFO, name: 'Полезная информация'},
    ],
};


export const publicRoutes: ProtectedRoute[] = [
    // Общие машруты для всех неавторизованных
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.LOGIN, element: LoginPage },
    { path: RouteNames.PROFILE, element: Profile },
]

export const privateRoutes: ProtectedRoute[] = [
    // Общие маршруты для всех авторизованных
    { path: RouteNames.MAIN, element: HomePage },
    { path: RouteNames.PERSONAL, element: Account },
    { path: RouteNames.PROFILE, element: Profile },
    { path: RouteNames.BELL, element: Bell },

    // Маршруты для пациентов
    { path: RouteNames.MAINPAT, element: MainPat, roles: ['PATIENT'] },
    { path: RouteNames.CONSULTATIONSPAT, element: ConsultationsPat, roles: ['PATIENT'] },
    { path: RouteNames.RECOMENDATIONS, element: Recomendations, roles: ['PATIENT'] },
    { path: RouteNames.SPECIALISTPAT, element: SpecialistsPat, roles: ['PATIENT'] },
    { path: RouteNames.USEFULINFOPAT, element: UsefulInfoPat, roles: ['PATIENT']},

    // Маршруты для врачей
    { path: RouteNames.CONSULTATIONSDOC, element: ConsultationsDoc, roles: ['DOCTOR'] },
    { path: RouteNames.TIMESHEET, element: TimeSheet, roles: ['DOCTOR'] },
    { path: RouteNames.USEFULINFODOC, element: UsefulInfoDoc, roles: ['DOCTOR']},

    // { path: RouteNames.HELP, element: Help, roles: ['DOCTOR'] },
    // { path: RouteNames.FINANCE, element: Finance, roles: ['DOCTOR'] },

    // Маршруты для администраторов
    { path: RouteNames.SPECIALISTS, element: Specialists, roles: ['ADMIN'] },
    { path: RouteNames.USERS, element: Users, roles: ['ADMIN'] },
    { path: RouteNames.MAKECONSULTATION, element: MakeConsultation, roles: ['ADMIN']},
    { path: RouteNames.ARCHIVECONSULTATIONS, element: ArchiveConsultations, roles: ['ADMIN']},
    { path: RouteNames.EDITUSEFULINFO, element: EditUsefulInformations, roles: ['ADMIN']},
];