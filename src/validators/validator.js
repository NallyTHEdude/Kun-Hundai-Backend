import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.js';

const validate = (validators) => {
    return async (req, res, next) => {
        await Promise.all(validators.map((validator) => validator.run(req)));

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return next(
            new ApiError(422, 'Received data is invalid', extractedErrors),
        );
    };
};

export { validate };
