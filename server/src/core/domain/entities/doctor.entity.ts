export default class Doctor {
    constructor(
        public id: number,
        public experienceYears: number,
        public diploma: string,
        public license: string,
        public isActivated: boolean,
        public specializations: string[],
        public userId?: number
    ) {}

    activate(): Doctor {
        return new Doctor(
            this.id,
            this.experienceYears,
            this.diploma,
            this.license,
            true,
            this.specializations, 
            this.userId
        );
    }
}