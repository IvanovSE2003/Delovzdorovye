import TimeSlot from "../entities/timeSlot.entity.js";

export default interface TimeSlotRepository {
    findByTimeDate(time: string, doctorId: number, date: string, status: "OPEN" | "CLOSE" | "BOOKED"): Promise<TimeSlot | null>;
    findById(id: number): Promise<TimeSlot | null>;
    findByDoctorId(id: number): Promise<TimeSlot[]>;
    findTimeSlotsBetweenDate(startDate: string, endDate: string): Promise<TimeSlot[]>;
    findByDoctorDate(doctorId: number, date: string): Promise<TimeSlot[]>;

    takeBreak(startDate: string, endDate: string, doctorId: number): Promise<void>;

    save(timeSlot: TimeSlot): Promise<TimeSlot>;
    create(timeSlot: TimeSlot): Promise<TimeSlot>;
    update(timeSlot: TimeSlot): Promise<TimeSlot>;    
    delete(id: number): Promise<void>;
}