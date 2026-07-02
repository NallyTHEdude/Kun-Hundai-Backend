import { ApiError } from './api-error.js';
import { logger } from './logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    // Unexpected errors
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [],
    });
};
