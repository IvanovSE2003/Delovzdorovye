export default class Doctor {
    constructor(
        public readonly id: number,
        public readonly specialization: string,
        public readonly contacts: string | null,
        public readonly experienceYears: number,
        public readonly isActivated: boolean
    ) {}

    activate(): Doctor {
        return new Doctor(
            this.id,
            this.specialization,
            this.contacts,
            this.experienceYears,
            this.isActivated
        );
    }
}