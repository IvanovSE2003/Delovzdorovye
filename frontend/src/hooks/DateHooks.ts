import dayjs from "dayjs";

export const getDateLabel = (date: string) => {
    const consultationDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    const tomorrow = today.add(1, "day");
    const yesterday = today.add(-1, "day");

    if (consultationDate.isSame(today)) return "Сегодня";
    if (consultationDate.isSame(tomorrow)) return "Завтра";
    if (consultationDate.isSame(yesterday)) return "Вчера";
    return consultationDate.format("DD.MM.YYYY");
};

export const formatDateWithoutYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long"
    });
};