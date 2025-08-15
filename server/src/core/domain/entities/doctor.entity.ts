export default class Doctor {
    constructor(
        public readonly id: number,
        public readonly specialization: string,
        public readonly experienceYears: number,
        public readonly diploma: string,
        public readonly license: string,
        public readonly isActivated: boolean,
        public readonly userId?: number
    ) {}

    activate(): Doctor {
        return new Doctor(
            this.id,
            this.specialization,
            this.experienceYears,
            this.diploma,
            this.license,
            true,
            this.userId
        );
    }
}