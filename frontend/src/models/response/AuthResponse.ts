// import type { IUser } from '../IUser';

interface IUser {
  id: number;
  email: string;
  isActivated: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUser;
}