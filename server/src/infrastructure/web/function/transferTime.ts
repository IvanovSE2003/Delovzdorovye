import { ITimeZones } from "../../../../../frontend/src/models/TimeZones";
import TimeSlot from "../../../core/domain/entities/timeSlot.entity";

const STORAGE_TIMEZONE = ITimeZones.MOSCOW;

export function adjustTimeSlotToTimeZone(slot: TimeSlot, userTimeZone: ITimeZones): TimeSlot {
    const timeDifference = userTimeZone - STORAGE_TIMEZONE;

    const { newTime, newDate } = adjustDateTime(slot.date, slot.time, timeDifference);

    return new TimeSlot(
        slot.id,
        newTime,
        newDate,
        slot.isRecurring,
        slot.dayWeek,
        slot.status,
        slot.doctorId
    );
}

export function adjustDateTime(date: string, time: string, hoursDiff: number): { newTime: string, newDate: string } {
    const [hours, minutes] = time.split(":").map(Number);

    // создаём полноценный Date (UTC, чтобы избежать локальных сдвигов)
    const jsDate = new Date(date + "T" + time + ":00Z");

    // применяем сдвиг
    jsDate.setHours(jsDate.getHours() + hoursDiff);

    // получаем новые значения
    const newHours = jsDate.getUTCHours();
    const newMinutes = jsDate.getUTCMinutes();
    const newDate = jsDate.toISOString().split("T")[0];

    return {
        newTime: `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`,
        newDate
    };
}

// Используется при сохранении, чтобы привести в Москву
export function convertUserTimeToMoscow(date: string, time: string, userTimeZone: ITimeZones): { newTime: string, newDate: string } {
    const hoursDiff = STORAGE_TIMEZONE - userTimeZone;
    return adjustDateTime(date, time, hoursDiff);
}
