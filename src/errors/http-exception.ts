class HttpException extends Error {
    public status: number;
    public message: string;
    public errors?: any;
    constructor(status: number, message: string, errors?: any) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
    getError() {
        return {
            statusCode: this.status,
            errorMessage: this.message,
            errors: this.errors
        };
    }
}

export default HttpException;