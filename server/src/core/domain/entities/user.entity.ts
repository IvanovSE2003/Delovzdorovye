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
        public isActivatedSMS: boolean,
        public activationLink: string,
        public img: string,
        public role: 'PATIENT' | 'DOCTOR' | 'ADMIN',
        public twoFactorCode: string | null,
        public twoFactorCodeExpires: Date | null,
        public resetToken: string | null,
        public resetTokenExpires: Date | null,
        public pinAttempts: number, 
        public isBlocked: boolean, 
        public blockedUntil: Date | null,
        public sentChanges: boolean | null
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
        );
    }

    updateAvatar(fileName: string): User {
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
            this.isActivatedSMS,
            this.activationLink,
            fileName,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
        )
    }

    activateSMS(): User {
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
            true,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            code,
            expires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            resetToken,
            resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
        );
    }

    incrementPinAttempts(): User {
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts + 1,
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
        );
    }

    resetPinAttempts(): User {
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            0, 
            this.isBlocked,
            this.blockedUntil,
            this.sentChanges
        );
    }

    blockAccount(): User {
        const blockDuration = 30 * 60 * 1000;
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts,
            true, 
            new Date(Date.now() + blockDuration),
            this.sentChanges
        );
    }

    unblockAccount(): User {
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            0,
            false, 
            null,
            this.sentChanges
        );
    }

    setSentChanges(): User {
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
            this.isActivatedSMS,
            this.activationLink,
            this.img,
            this.role,
            this.twoFactorCode,
            this.twoFactorCodeExpires,
            this.resetToken,
            this.resetTokenExpires,
            this.pinAttempts, 
            this.isBlocked,
            this.blockedUntil,
            true
        );
    }
}