export default class Doctor {
    constructor(
        public id: number,
        public experienceYears: number,
        public isActivated: boolean,
        public userId?: number,
        public user?: {
            id: number;
            img: string,
            name: string | null;
            surname: string | null;
            patronymic: string | null;
            time_zone: number | null;
        } | null,
        public profData?: Array<{
            id: number;
            specialization?: string | null;
            diploma?: string | null;
            license?: string | null;
        }> | null
    ) {}

    setYear(year: number) {
        this.experienceYears = year;
        return this;
    }
}