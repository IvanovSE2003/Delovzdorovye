export default class Doctor {
    constructor(
        public id: number,
        public specialization: string,
        public experienceYears: number,
        public diploma: string,
        public license: string,
        public isActivated: boolean,
        public userId?: number
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