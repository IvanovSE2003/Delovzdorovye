export default function normalizeDate(input: string): string {
    if (!input) return "";

    const clean = input.replace(/['"]+/g, "").trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return clean;
    }

    const d = new Date(clean);
    if (isNaN(d.getTime())) {
        return "";
    }

    return d.toISOString().split("T")[0];
}
