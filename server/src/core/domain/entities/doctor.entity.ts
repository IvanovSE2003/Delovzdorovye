export default class Doctor {
    constructor(
        public id: number,
        public experienceYears: number,
        public isActivated: boolean,
        public userId?: number,
        public user?: {
            id: number;
            name: string | null;
            surname: string | null;
            patronymic: string | null;
        } | null,
        public specializations?: Array<{
            id: number;
            name: string;
            diploma?: string;
            license?: string;
        }> | null
    ) {}

    setYear(year: number) {
        this.experienceYears = year;
        return this;
    }
}