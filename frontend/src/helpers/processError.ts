import type { AxiosError } from "axios";
import type { TypeResponse } from "../models/response/DefaultResponse";

// Вывод ошибки с сервера
export const processError = (e: unknown, message: string, showError?: (msg: string) => void) => {
    const error = e as AxiosError<TypeResponse>;
    const msg = `${message} ${error.response?.data.message ?? ""}`;
    showError && showError(msg);
};