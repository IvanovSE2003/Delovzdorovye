type Time = `${number}:${number}`;

export default class DoctorSchedule {
    constructor(
        public readonly id: number,
        public readonly date: Date,
        public readonly day_weekly: string,
        public readonly time_start: Time,
        public readonly time_end: Time,
        public readonly doctorId?: number,
        public readonly timeSlot?: timeSlotData
    ) {}
}

interface timeSlotData {
    time? : string,
    is_available? : boolean
}