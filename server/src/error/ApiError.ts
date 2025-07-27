class ApiError extends Error {
    public status: number;  
    public message: string;

    constructor(status: number, messange: string) {
        super()
        this.status = status;
        this.message = messange;    
    }

    static badRequest(message: string) {
        return new ApiError(404, message)
    }

    static internal(message: string) {
        return new ApiError(500, message)
    }

    static forbiden(message: string) {
        return new ApiError(403, message)
    }

    static notAuthorized(message: string) {
        return new ApiError(401, message)
    }

    static tokenInvalid(message: string) {
        return new ApiError(501, message)
    }
}

export default ApiError;