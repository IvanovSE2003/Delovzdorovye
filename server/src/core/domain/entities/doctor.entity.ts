export default class Doctor {
    constructor(
        public readonly id: number,
        public readonly experienceYears: number,
        public readonly diploma: string,
        public readonly license: string,
        public readonly isActivated: boolean,
        public readonly specializations: string[],
        public readonly userId?: number,
        public readonly userName?: string,
        public readonly userSurname?: string,
        public readonly userPatronymic?: string,
        public readonly userAvatar?: string,
        public readonly userGender?: string
    ) {}
}