import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.js';

const validate = (validators) => {
    return async (req, res, next) => {
        await Promise.all(validators.map((validator) => validator.run(req)));

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const groupedErrors = new Map();

        for (const err of errors.array()) {
            if (!groupedErrors.has(err.path)) {
                groupedErrors.set(err.path, []);
            }

            groupedErrors.get(err.path).push(err.msg);
        }

        const extractedErrors = Array.from(
            groupedErrors,
            ([field, messages]) => ({
                field,
                errors: messages,
            }),
        );

        return next(
            new ApiError(422, 'Received data is invalid', extractedErrors),
        );
    };
};

export { validate };
