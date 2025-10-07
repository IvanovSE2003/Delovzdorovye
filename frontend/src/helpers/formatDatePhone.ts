import dayjs from "dayjs";

// Отформатировать дату из ****-**-** в ****.**.**
export const GetFormatDate = (date: string) => {
    return date?.split('-').reverse().join('.');
};

// Отформатировать дату из ISO формата
export const formatDateFromISO = (date: string, includeTime: boolean = true) => {
    const newDate = new Date(date);
    const day = String(newDate.getDate()).padStart(2, '0');
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const year = newDate.getFullYear();

    if (!includeTime) {
        return `${day}.${month}.${year}`;
    }

    const hours = String(newDate.getHours()).padStart(2, '0');
    const minutes = String(newDate.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Форматировать дату в формат число + название месяца
export const formatDateWithoutYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long"
    });
};

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


// Отформатировать из даты в строку ****-**-**
export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Отформатировать номер телефона в формате 8 888 888 88 88
export const GetFormatPhone = (phone: string) => {
    return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
};

// Нормализовать номер телефона в формат 88888888888
export const normalizePhone = (phone?: string | null): string => {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("7")) {
        digits = "8" + digits.slice(1);
    }
    return digits;
};

