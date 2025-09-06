export default class TimeSlot {
    constructor(
        public id: number,
        public time: string,
        public date: string,
        public isRecurring: boolean,
        public dayWeek: number,
        public status: "OPEN" | "CLOSE" | "BOOKED",
        public doctorId?: number
    ) {}

    setStatus(status: "OPEN" | "CLOSE" | "BOOKED") {
        this.status = status;
        return this;
    }
}