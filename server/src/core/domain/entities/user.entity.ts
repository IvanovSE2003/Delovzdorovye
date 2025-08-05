export default class User {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly surname: string,
        public readonly patronymic: string,
        public readonly email: string,
        public readonly phone: string,
        public readonly pinCode: number,
        public readonly password: string,
        public readonly timeZone: number,
        public readonly dateBirth: Date,
        public readonly gender: string,
        public readonly isActivated: boolean,
        public readonly activationLink: string,
        public readonly img: string,
        public readonly role: 'PACIENT' | 'DOCTOR' | 'ADMIN',
        public readonly resetPasswordToken: string | null,
        public readonly resetPasswordExpires: Date | null
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