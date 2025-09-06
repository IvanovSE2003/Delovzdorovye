export function getRussianDayName(dayWeek: number): string {
    const days: Record<number, string> = {
        0: "Понедельник",
        1: "Вторник",
        2: "Среда",
        3: "Четверг",
        4: "Пятница",
        5: "Суббота",
        6: "Воскресенье"
    };

    return days[dayWeek] ?? "Неизвестный день";
}
