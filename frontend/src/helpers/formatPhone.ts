// Отформатировать номер телефона в формате 8 (888) 888 88 88
export const GetFormatPhone = (phone: string) => {
    return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($2) $3 $4 $5');
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