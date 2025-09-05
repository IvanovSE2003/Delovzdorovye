function normalizeDate(input: string): string {
    if (!input) return "";

    const clean = input.replace(/['"]+/g, "").trim();

    const d = new Date(clean);
    if (isNaN(d.getTime())) {
        return "";
    }

    return d.toISOString().slice(0, 10);
}


export default normalizeDate;