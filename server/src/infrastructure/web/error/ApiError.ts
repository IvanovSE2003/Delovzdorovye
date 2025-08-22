class ApiError extends Error {
    public status: number;  
    public message: string;
    public success: boolean;

    constructor(status: number, success: boolean, message: string) {
        super()
        this.status = status;
        this.message = message;    
        this.success = success;
    }

    static badRequest(message: string) {
        return new ApiError(404, false, message);
    }

    static internal(message: string) {
        return new ApiError(500, false, message);
    }

    static forbiden(message: string) {
        return new ApiError(403, false, message);
    }

    static notAuthorized(message: string) {
        return new ApiError(401, false, message);
    }

    static tokenInvalid(message: string) {
        return new ApiError(505, false, message);
    }
}

export default ApiError;