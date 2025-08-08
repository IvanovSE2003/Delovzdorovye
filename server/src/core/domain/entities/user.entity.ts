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
        public role: 'PATIENT' | 'DOCTOR' | 'ADMIN',
        public twoFactorCode: string | null,
        public twoFactorCodeExpires: Date | null,
        public resetToken: string | null,
        public resetTokenExpires: Date | null
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
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires
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
            expires,
            this.resetToken,
            this.resetTokenExpires
        );
    }

    setResetToken(resetToken: string | null, resetTokenExpires: Date | null, pin_code: number) {
        return new User(
            this.id,
            this.name,
            this.surname,
            this.patronymic,
            this.email,
            this.phone,
            pin_code,
            this.timeZone,
            this.dateBirth,
            this.gender,
            this.isActivated,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            resetToken,
            resetTokenExpires
        );
    }
}