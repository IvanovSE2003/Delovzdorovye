export default class TimeSlot {
    constructor(
        public id: number,
        public time: string,
        public isAvailable: boolean,
        public doctorsScheduleId?: number
    ) {}

    setAvailable(flag: boolean) {
        this.isAvailable = flag;
        return this;
    }
}