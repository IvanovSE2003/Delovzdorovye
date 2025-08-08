import ApiError from "../error/ApiError.js";
export default function errorHandler(err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message });
    }
    return res.status(500).json({
        message: 'Непредвиденная ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
}
//# sourceMappingURL=ErrorHandlingMidleware.js.map