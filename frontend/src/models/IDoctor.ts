export interface IDoctor {
    id: number;
    isActivated: boolean;
    profData: Specialization[];
    user: UserDoctor;
    userAvatar?: string;
}

export interface Specialization {
    id: any;
    specialization?: string;
    specializationId: number;
    comment?: string;
    diploma: File | null;
    license: File | null;
    diplomaUrl?: string;
    licenseUrl?: string;
}

interface UserDoctor {
    id: number;
    img: string;
    name: string;
    surname: string;
    patronymic?: string;
    time_zone: number;
}