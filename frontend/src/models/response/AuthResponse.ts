import type { IUser } from '../Auth';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUser;
}