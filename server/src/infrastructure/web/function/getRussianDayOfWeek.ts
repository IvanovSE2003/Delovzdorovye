const getRussianDayOfWeek = (dateString: string): string => {
    const days = [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота'
    ];

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        throw new Error('Неверный формат даты');
    }

    return days[date.getDay()];
}

export default getRussianDayOfWeek;