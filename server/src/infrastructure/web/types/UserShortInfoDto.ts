export default interface UserShortInfoDto {
    role: string;
    name: string | null;
    surname: string | null;
    patronymic: string | null;
    img: string;
    phone: string;
    gender: string;
    email: string;
    specialization?: string | null;
    diploma?: string | null;
    license?: string | null;
    isBlocked: boolean;
}