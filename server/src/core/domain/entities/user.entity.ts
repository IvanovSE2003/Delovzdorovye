export default class User {
    constructor(
        public id: number,
        public name: string,
        public surname: string,
        public patronymic: string,
        public email: string,
        public phone: string,
        public pinCode: number,
        private _password: string,
        public timeZone: number,
        public dateBirth: Date,
        public gender: string,
        public isActivated: boolean,
        public activationLink: string,
        public img: string,
        public role: 'PACIENT' | 'DOCTOR' | 'ADMIN',
        public resetPasswordToken: string | null,
        public resetPasswordExpires: Date | null
    ) {}

    get password(): string {
        return this._password;
    }

    setPassword(newPassword: string): void {
        this._password = newPassword;
    }

    activate(): User {
        return new User(
            this.id,
            this.name,
            this.surname,
            this.patronymic,
            this.email,
            this.phone,
            this.pinCode,
            this.password,
            this.timeZone,
            this.dateBirth,
            this.gender,
            this.isActivated,
            this.activationLink,
            this.img,
            this.role,
            this.resetPasswordToken,
            this.resetPasswordExpires
        );
    }

    setResetPasswordToken(token: string, expires: Date): User {
        return new User(
            this.id,
            this.name,
            this.surname,
            this.patronymic,
            this.email,
            this.phone,
            this.pinCode,
            this.password,
            this.timeZone,
            this.dateBirth,
            this.gender,
            this.isActivated,
            this.activationLink,
            this.img,
            this.role,
            token,
            expires
        );
    }
}