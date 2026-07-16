import { body, query, param } from 'express-validator';
import { ServiceStatus } from '../../constants/serviceVisit.constants.js';
import { VehicleType } from '../../constants/vehicle.constants.js';

const createServiceLogValidator = () => {
    return [
        body('vehicleNumber')
            .trim()
            .notEmpty()
            .withMessage('Vehicle number is required'),

        body('vehicleType')
            .trim()
            .notEmpty()
            .withMessage('Vehicle type is required')
            .isIn(VehicleType)
            .withMessage(
                `Vehicle type must be one of: ${VehicleType.join(', ')}`,
            ),

        // body('vehicleMake')
        //     .trim()
        //     .notEmpty()
        //     .withMessage('Vehicle make is required'),

        body('vehicleModel')
            .trim()
            .notEmpty()
            .withMessage('Vehicle model is required'),

        body('vehicleYear')
            .notEmpty()
            .withMessage('Vehicle year is required')
            .isInt({ min: 1886 })
            .withMessage('Vehicle year must be a valid year'),

        // body('vehicleColor')
        //     .trim()
        //     .notEmpty()
        //     .withMessage('Vehicle color is required'),

        body('customerName')
            .trim()
            .notEmpty()
            .withMessage('Customer name is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Customer name must be between 3 and 50 characters'),

        body('customerNumber')
            .trim()
            .notEmpty()
            .withMessage('Customer number is required')
            .matches(/^\+?\d{10}$/)
            .withMessage('Customer number is invalid'),

        // body('customerAddress').optional().trim(),

        body('kilometersDriven')
            .notEmpty()
            .withMessage('Kilometers driven is required')
            .isInt({ min: 0 })
            .withMessage('Kilometers driven must be a positive number'),

        // body('serviceType')
        //     .trim()
        //     .notEmpty()
        //     .withMessage('Service type is required'),

        // body('estimatedPrice')
        //     .optional()
        //     .toFloat()
        //     .isFloat({ min: 0 })
        //     .withMessage('Estimated price must be a valid number'),

        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required'),

        // body('serviceStatus')
        //     .optional()
        //     .isIn(ServiceStatus)
        //     .withMessage(
        //         `Service status must be one of: ${ServiceStatus.join(', ')}`,
        //     ),

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

        body('estimatedPrice')
            .optional()
            .toFloat()
            .isFloat({ min: 0 })
            .withMessage('Estimated price must be a valid number'),

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

const filterServiceLogValidator = () => {
    return [
        query('vehicleNumber').optional().trim(),

        query('vehicleType')
            .optional()
            .trim()
            .isIn(VehicleType)
            .withMessage(
                `Vehicle type must be one of: ${VehicleType.join(', ')}`,
            ),

        query('customerNumber').optional().trim(),

        query('serviceStatus')
            .optional()
            .isIn(ServiceStatus)
            .withMessage(
                `Service status must be one of: ${ServiceStatus.join(', ')}`,
            ),

        query('scheduledAt')
            .optional()
            .isISO8601()
            .withMessage('Scheduled date must be a valid ISO date'),

        query('completedAt')
            .optional()
            .isISO8601()
            .withMessage('Completed date must be a valid ISO date'),

        query('addedBy')
            .optional()
            .isUUID()
            .withMessage('Added by must be a valid UUID'),
    ];
};

const getServiceLogByIdValidator = () => {
    return [
        param('id')
            .isUUID()
            .withMessage('ID must be a valid UUID'),
    ];
};

export { createServiceLogValidator, updateServiceLogValidator, filterServiceLogValidator, getServiceLogByIdValidator };
