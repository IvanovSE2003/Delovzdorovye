import TimeSlotsArray from "../../../infrastructure/web/types/timeSlot.type.js";

type Time = `${number}:${number}`;

export default class DoctorSchedule {
    constructor(
        public id: number,
        public date: string,
        public day_weekly: string,
        public doctorId?: number,
        public timeSlot?: TimeSlotsArray
    ) {}
}

