export default class Consultation {
    constructor(
        public id: number,
        public datetimeConsult: Date,
        public status: string,
        public problemsData: Record<string, any>,
        public recommendations: string,
        public duration: number | null
    ) {}
}