import { ITimeZones } from "../../../../../frontend/src/models/TimeZones";
import TimeSlot from "../../../core/domain/entities/timeSlot.entity";

const STORAGE_TIMEZONE = ITimeZones.MOSCOW;

export function adjustTimeSlotToTimeZone(slot: TimeSlot, userTimeZone: ITimeZones): TimeSlot {
    const timeDifference = userTimeZone - STORAGE_TIMEZONE;

    return new TimeSlot(
        slot.id,
        adjustTime(slot.time, timeDifference),
        adjustDate(slot.date, timeDifference),
        slot.isRecurring,
        slot.dayWeek,
        slot.status,
        slot.doctorId
    );
}

export function adjustTime(time: string, hoursDiff: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + hoursDiff;

    if (newHours >= 24) {
        newHours -= 24;
    } else if (newHours < 0) {
        newHours += 24;
    }

    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function adjustDate(date: string, hoursDiff: number): string {
    if (hoursDiff === 0) return date;

    const jsDate = new Date(date);
    jsDate.setHours(jsDate.getHours() + hoursDiff);
    return jsDate.toISOString().split('T')[0];
}

export function convertUserTimeToMoscow(time: string, userTimeZone: ITimeZones): string {
    const hoursDiff = STORAGE_TIMEZONE - userTimeZone;
    return adjustTime(time, hoursDiff);
}
