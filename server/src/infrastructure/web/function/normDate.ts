export default function normalizeDate(input: string): string {
    if (!input) return "";

    const clean = input.replace(/['"]+/g, "").trim();

    // Если строка уже в формате YYYY-MM-DD — оставляем как есть
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return clean;
    }

    // Иначе пробуем распарсить
    const d = new Date(clean);
    if (isNaN(d.getTime())) {
        return "";
    }

    // Но берём только дату в локальной зоне сервера, не через toISOString
    return d.toISOString().split("T")[0];
}
