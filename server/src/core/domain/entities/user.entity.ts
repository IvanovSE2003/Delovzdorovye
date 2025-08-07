export default class User {
    constructor(
        public id: number,
        public name: string,
        public surname: string,
        public patronymic: string,
        public email: string,
        public phone: string,
        public pinCode: number,
        public timeZone: number,
        public dateBirth: Date,
        public gender: string,
        public isActivated: boolean,
        public activationLink: string,
        public img: string,
        public role: 'PACIENT' | 'DOCTOR' | 'ADMIN',
        public twoFactorCode: string | null,
        public twoFactorCodeExpires: Date | null
    ) {}

    activate(): User {
        return new User(
            this.id,
            this.name,
            this.surname,
            this.patronymic,
            this.email,
            this.phone,
            this.pinCode,
            this.timeZone,
            this.dateBirth,
            this.gender,
            true,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires
        );
    }

    setTwoFactorCode(code: string, expires: Date): User {
        return new User(
            this.id,
            this.name,
            this.surname,
            this.patronymic,
            this.email,
            this.phone,
            this.pinCode,
            this.timeZone,
            this.dateBirth,
            this.gender,
            this.isActivated,
            this.activationLink,
            this.img,
            this.role,
            code,
            expires
        );
    }

}