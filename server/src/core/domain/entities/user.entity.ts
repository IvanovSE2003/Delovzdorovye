export default class User {
    constructor(
        public id: number,
        public name: string | null,
        public surname: string | null,
        public patronymic: string | null,
        public email: string,
        public phone: string,
        public pinCode: number,
        public timeZone: number,
        public dateBirth: string | null,
        public gender: string | null,
        public pending_img: string | null,
        public pending_name: string | null,
        public pending_surname: string | null,
        public pending_patronymic: string | null,
        public pending_date_birth: string | null,
        public pending_gender: string | null,
        public hasPendingChanges: boolean | null,
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
        public sentChanges: boolean | null,
        public isAnonymous: boolean | null
    ) { }

    activate(): User {
        this.isActivated = true;
        return this;
    }

    activateSMS(): User {
        this.isActivatedSMS = true;
        return this;
    }

    updateAvatar(fileName: string): User {
        this.img = fileName;
        return this;
    }

    setTwoFactorCode(code: string, expires: Date): User {
        this.twoFactorCode = code;
        this.twoFactorCodeExpires = expires;
        return this;
    }

    setResetToken(resetToken: string | null, resetTokenExpires: Date | null, pin_code: number) {
        this.pinCode = pin_code;
        this.resetToken = resetToken;
        this.resetTokenExpires = resetTokenExpires;
        return this;
    }

    incrementPinAttempts(): User {
        this.pinAttempts = this.pinAttempts + 1;
        return this;
    }

    resetPinAttempts(): this {
        this.pinAttempts = 0;
        return this;
    }

    blockAccount(): User {
        const blockDuration = 30 * 60 * 1000;
        this.isBlocked = true;
        this.blockedUntil = new Date(Date.now() + blockDuration);
        return this;
    }

    unblockAccount(): User {
        this.pinAttempts = 0;
        this.isBlocked = false;
        this.blockedUntil = null;
        return this;
    }

    setSentChanges(sentChanges: boolean): User {
        this.sentChanges = sentChanges;
        return this;
    }

    setRole(role: "PATIENT" | "DOCTOR" | "ADMIN"): User {
        this.role = role;
        return this;
    }

    setAnonymous(flag: boolean) {
        this.isActivated = flag;
        return this;
    }

    updateEmail(email: string) {
        this.email = email;
        return this;
    }

    cloneWithChanges(changes: Partial<User>): User {
        return new User(
            this.id,
            changes.name ?? this.name,
            changes.surname ?? this.surname,
            changes.patronymic ?? this.patronymic,
            changes.email ?? this.email,
            changes.phone ?? this.phone,
            changes.pinCode ?? this.pinCode,
            changes.timeZone ?? this.timeZone,
            changes.dateBirth ?? this.dateBirth,
            changes.gender ?? this.gender,
            changes.pending_img ?? this.pending_img,
            changes.pending_name ?? this.pending_name,
            changes.pending_surname ?? this.pending_surname,
            changes.pending_patronymic ?? this.pending_patronymic,
            changes.pending_gender ?? this.pending_gender,
            changes.pending_date_birth ?? this.pending_date_birth,
            changes.hasPendingChanges ?? this.hasPendingChanges,
            changes.isActivated ?? this.isActivated,
            changes.isActivatedSMS ?? this.isActivatedSMS,
            changes.activationLink ?? this.activationLink,
            changes.img ?? this.img,
            changes.role ?? this.role,
            changes.twoFactorCode ?? this.twoFactorCode,
            changes.twoFactorCodeExpires ?? this.twoFactorCodeExpires,
            changes.resetToken ?? this.resetToken,
            changes.resetTokenExpires ?? this.resetTokenExpires,
            changes.pinAttempts ?? this.pinAttempts,
            changes.isBlocked ?? this.isBlocked,
            changes.blockedUntil ?? this.blockedUntil,
            changes.sentChanges ?? this.sentChanges,
            changes.isAnonymous ?? this.isAnonymous
        );
    }
}