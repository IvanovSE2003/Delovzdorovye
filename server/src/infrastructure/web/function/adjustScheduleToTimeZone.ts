import DoctorSchedule from "../../../core/domain/entities/doctorSchedule.entity.js";

const adjustScheduleToTimeZone = (schedule: DoctorSchedule, userTimeZone: number): DoctorSchedule => {
    const adjustTime = (time: string): `${number}:${number}` => {
        const [hours, minutes] = time.split(":").map(Number);

        const date = new Date();
        date.setUTCHours(hours, minutes, 0, 0);

        date.setHours(date.getHours() + userTimeZone);

        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");

        return `${hh}:${mm}` as `${number}:${number}`;
    };

    const adjustedSlots = schedule.timeSlot?.map(slot => ({
        time: adjustTime(slot.time),
        is_available: slot.is_available
    }));

    return new DoctorSchedule(
        schedule.id,
        schedule.date,
        schedule.day_weekly,
        schedule.doctorId,
        adjustedSlots
    );
}

export default adjustScheduleToTimeZone;
