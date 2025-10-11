export function getActualField<T extends object>(data: T, field: keyof T, mode?: string) {
  if (mode === "OWN") {
    const pendingKey = `pending_${String(field)}` as keyof T;
    return data[pendingKey] ?? data[field];
  }
  return data[field];
}
