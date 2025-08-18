import type { IUser } from '../Auth';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUser;
}

export interface LoginResponse {
    success: boolean;
    tempToken: string;
    message: string;
}