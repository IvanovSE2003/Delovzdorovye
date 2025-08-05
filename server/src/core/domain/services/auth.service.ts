import User from "../entities/user.entity.js";

export default interface AuthService {
    register(
        email: string,
        password: string,
        role: 'PACIENT' | 'DOCTOR' | 'ADMIN',
        name: string,
        surname: string,
        patronymic: string,
        phone: string,
        pinCode: number,
        gender: string,
        dateBirth: Date,
        timeZone: number,
        specialization: string,
        contacts: string,
        experienceYears: number
    ): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    login(
        credential: string,
        password: string,
        pinCode: number
    ): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    logout(refreshToken: string): Promise<void>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    activate(activationLink: string): Promise<void>;
}