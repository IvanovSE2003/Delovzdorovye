import TimeSlot from "../entities/timeSlot.entity.js";

export default interface TimeSlotRepository {
    findByTimeDate(time: string, doctorId: number, date: string, isAvailable: boolean): Promise<TimeSlot | null>;
    findById(id: number): Promise<TimeSlot | null>;
    save(timeSlot: TimeSlot): Promise<TimeSlot>;
    create(timeSlot: TimeSlot): Promise<TimeSlot>;
    update(timeSlot: TimeSlot): Promise<TimeSlot>;    
    delete(id: number): Promise<void>;
}