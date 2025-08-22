import TimeSlotsArray from "../../../infrastructure/web/types/timeSlot.type.js";

type Time = `${number}:${number}`;

export default class DoctorSchedule {
    constructor(
        public id: number,
        public date: Date,
        public day_weekly: string,
        public time_start: Time,
        public time_end: Time,
        public doctorId?: number,
        public timeSlot?: TimeSlotsArray
    ) {}
}

