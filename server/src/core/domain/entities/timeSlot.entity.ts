export default class TimeSlot {
    constructor(
        public id: number,
        public time: string,
        public datetime: Date, // Добавляем
        public isAvailable: boolean,
        public consultationId?: number,
        public patientId?: number,
        public doctorScheduleId?: number
    ) {}
}