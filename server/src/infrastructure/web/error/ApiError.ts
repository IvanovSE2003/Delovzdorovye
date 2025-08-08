class ApiError extends Error {
    public status: number;  
    public message: string;
    public errors: any[];
    public originalError?: Error;

    constructor(status: number, message: string, errors: any[] = []) {
        super()
        this.status = status;
        this.message = message;    
        this.errors = errors;
    }

    withOriginalError(error: Error): this {
        this.originalError = error;
        return this;
    }

    static badRequest(message: string) {
        return new ApiError(404, message);
    }

    static internal(message: string) {
        return new ApiError(500, message);
    }

    static forbiden(message: string) {
        return new ApiError(403, message);
    }

    static notAuthorized(message: string) {
        return new ApiError(401, message);
    }

    static tokenInvalid(message: string) {
        return new ApiError(505, message);
    }

    static errorValidation(message: string, errors = [] as any) {
        return new ApiError(400, message, errors);
    }
}

export default ApiError;