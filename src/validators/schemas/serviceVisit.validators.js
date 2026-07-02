import { body } from 'express-validator';
import { ServiceStatus } from '../../constants/serviceVisit.constants.js';

const createServiceLogValidator = () => {
    return [
        body('vehicleNumber')
            .trim()
            .notEmpty()
            .withMessage('Vehicle number is required'),

        body('vehicleType')
            .trim()
            .notEmpty()
            .withMessage('Vehicle type is required'),

        body('customerName')
            .trim()
            .notEmpty()
            .withMessage('Customer name is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Customer name must be between 3 and 50 characters'),

        body('customerPhoneNumber')
            .trim()
            .notEmpty()
            .withMessage('Customer phone number is required')
            .matches(/^\+?\d{10}$/)
            .withMessage('Customer phone number is invalid'),

        body('customerAddress').optional().trim(),

        body('kilometersDriven')
            .notEmpty()
            .withMessage('Kilometers driven is required')
            .isInt({ min: 0 })
            .withMessage('Kilometers driven must be a positive number'),

        body('serviceType')
            .trim()
            .notEmpty()
            .withMessage('Service type is required'),

        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required'),

        body('serviceStatus')
            .optional()
            .isIn(ServiceStatus)
            .withMessage(
                `Service status must be one of: ${ServiceStatus.join(', ')}`,
            ),

        body('scheduledAt')
            .notEmpty()
            .withMessage('Scheduled date is required')
            .isISO8601()
            .withMessage('Scheduled date must be a valid ISO date'),
    ];
};

const updateServiceLogValidator = () => {
    return [
        body('kilometersDriven')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Kilometers driven must be a positive number'),

        body('serviceType')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Service type cannot be empty'),

        body('description')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Description cannot be empty'),

        body('serviceStatus')
            .optional()
            .isIn(ServiceStatus)
            .withMessage(
                `Service status must be one of: ${ServiceStatus.join(', ')}`,
            ),

        body('scheduledAt')
            .optional()
            .isISO8601()
            .withMessage('Scheduled date must be a valid ISO date'),
    ];
};

export { createServiceLogValidator, updateServiceLogValidator };
