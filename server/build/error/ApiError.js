class ApiError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }
    static badRequest(message) {
        return new ApiError(404, message);
    }
    static internal(message) {
        return new ApiError(500, message);
    }
    static forbiden(message) {
        return new ApiError(403, message);
    }
    static notAuthorized(message) {
        return new ApiError(401, message);
    }
    static tokenInvalid(message) {
        return new ApiError(501, message);
    }
}
export default ApiError;
//# sourceMappingURL=ApiError.js.map