import { ITimeZones } from "../../../../../frontend/src/models/TimeZones";
import DoctorSchedule from "../../../core/domain/entities/doctorSchedule.entity";

const STORAGE_TIMEZONE = ITimeZones.MOSCOW;

export function adjustScheduleToTimeZone(schedule: DoctorSchedule, userTimeZone: ITimeZones): DoctorSchedule {
    const timeDifference = userTimeZone - STORAGE_TIMEZONE;

    return {
        ...schedule,
        date: adjustDate(schedule.date, timeDifference),
        timeSlot: schedule.timeSlot?.map(slot => ({
            ...slot,
            time: adjustTime(slot.time, timeDifference)
        }))
    };
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
