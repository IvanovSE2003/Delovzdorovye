export default class Consultation {
    constructor(
        public readonly id: number,
        public readonly datetimeConsult: Date,
        public readonly status: string,
        public readonly problemsData: Record<string, any>,
        public readonly recommendations: string,
        public readonly duration: number | null
    ) {}
}