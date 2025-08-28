import type React from "react";

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
    // Общие пути
    LOGIN: '/login',
    MAIN: '/',
    PERSONAL: '/personal',
    RESET: '/pinCode-reset/:token',
    USEFULINFO: '/usefulinfo',
    PROFILE: '/profile/:id',
    BELL: '/notifications',

    // Пути для пациента
    CONSULTATIONSPAT: '/patient/consultations',
    RECOMENDATIONS: '/patient/recomendations',
    SPECIALISTPAT: '/patient/specialist',
    MAINPAT: '/patient/main',

    // Пути для доктора
    CONSULTATIONSDOC: '/doctor/consultations',
    TIMESHEET: '/doctor/timesheet',
    HELP: '/doctor/help',
    FINANCE: '/doctor/finance',

    // Пути для админа
    SPECIALISTS: '/admin/specialists',
    USERS: '/admin/users',
} as const;
