import { body, param } from 'express-validator';

const getVehicleDetailsValidator = () => {
	return [
		body('vehicleId')
			.trim()
			.notEmpty()
			.withMessage('Vehicle ID is required')
			.isUUID()
			.withMessage('Vehicle ID must be a valid UUID'),
	];
};

const getVehicleServiceHistoryValidator = () => {
	return [
		param('vehicleId')
			.trim()
			.notEmpty()
			.withMessage('Vehicle ID is required')
			.isUUID()
			.withMessage('Vehicle ID must be a valid UUID'),
	];
};

export { getVehicleDetailsValidator, getVehicleServiceHistoryValidator };
