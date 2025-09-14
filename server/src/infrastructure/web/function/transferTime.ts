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
        slot.dayWeek,
        slot.status,
        slot.doctorId
    );
}

export function adjustDateTime(
    date: string,
    time: string,
    hoursDiff: number
): { newTime: string; newDate: string } {
    if (!date || !time) {
        throw new Error(`adjustDateTime: пустая дата или время (date=${date}, time=${time})`);
    }

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error(`adjustDateTime: неверный формат времени "${time}"`);
    }

    const [year, month, day] = date.split("-").map(Number);
    const jsDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    jsDate.setUTCHours(jsDate.getUTCHours() + hoursDiff);

    const newHours = jsDate.getUTCHours();
    const newMinutes = jsDate.getUTCMinutes();
    const newDate = jsDate.toISOString().split("T")[0];

    return {
        newTime: `${newHours.toString().padStart(2, "0")}:${newMinutes
            .toString()
            .padStart(2, "0")}`,
        newDate,
    };
}

export function convertUserTimeToMoscow(date: string, time: string, userTimeZone: ITimeZones): { newTime: string, newDate: string } {
    const hoursDiff = STORAGE_TIMEZONE - userTimeZone;
    return adjustDateTime(date, time, hoursDiff);
}

export function formatEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
}
