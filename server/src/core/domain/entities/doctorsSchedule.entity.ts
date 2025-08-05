export default class DoctorsSchedule {
    constructor(
        public readonly id: number,
        public readonly date: Date,
        public readonly dayWeekly: string,
        public readonly timeStart: string,
        public readonly timeEnd: string
    ) {}
}