export const GetFormatDate = (date: string) => {
    return date?.split('-').reverse().join('.');
};

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
    const seconds = String(newDate.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export const GetFormatPhone = (phone: string) => {
    return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
};

export const normalizePhone = (phone?: string | null): string => {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("7")) {
        digits = "8" + digits.slice(1);
    }
    return digits;
};

