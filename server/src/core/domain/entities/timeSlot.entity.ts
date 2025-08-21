export default class TimeSlot {
    constructor(
        public id: number,
        public time: Date,
        public is_available: boolean,
        public doctor_schedule_id: number,
        public doctor_id?: number
    ) {}
}