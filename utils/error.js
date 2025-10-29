import { HTTP_STATUS } from "./http_status";

// Convert stack string to array of frames
function parseStack(stack) {
    if (!stack) return [];
    // Each line after the first line is a frame
    return stack
        .split("\n")
        .slice(1)
        .map(line => line.trim());
}


// utils/errors.js
export class AppError extends Error {
    constructor(message, statusCode) {
        const httpStatus = HTTP_STATUS[statusCode]
        super(message);
        this.code = httpStatus.name;
        this.status = statusCode;
    }
}

// Common error response
export const commonError = (error, includeStack = true) => {
    if (error instanceof AppError) {
        return {
            success: false,
            code: error.code,
            message: error.message,
            status: error.status,
        };
    }

    // fallback for unexpected errors
    return {
        success: false,
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : String(error),
        status: 500,
        ...(includeStack && error instanceof Error && { stack: parseStack(error.stack) }),
    };
};