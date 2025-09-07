import dayjs from "dayjs";

export const getDateLabel = (date: string) => {
    const consultationDate = dayjs(date).startOf("day");
    console.log(consultationDate)
    const today = dayjs().startOf("day");
    const tomorrow = today.add(1, "day");

    if (consultationDate.isSame(today)) return "Сегодня";
    if (consultationDate.isSame(tomorrow)) return "Завтра";
    return consultationDate.format("DD.MM.YYYY");
};