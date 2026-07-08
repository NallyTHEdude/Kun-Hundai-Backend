import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import {
	getVehicleDetailsById,
	getVehicleServiceHistory,
} from '../services/vehicle.service.js';

const getVehicleDetailsController = asyncHandler(async (req, res) => {
	const { vehicleId } = req.body;

	if (!vehicleId) {
		throw new ApiError(400, 'Vehicle ID is required.');
	}

	const vehicle = await getVehicleDetailsById(vehicleId);

	return res.status(200).json(
		new ApiResponse(200, vehicle, 'Vehicle details retrieved successfully'),
	);
});

const getVehicleServiceHistoryController = asyncHandler(async (req, res) => {
	const { vehicleId } = req.params;

	const serviceHistory = await getVehicleServiceHistory(vehicleId);

	return res.status(200).json(
		new ApiResponse(
			200,
			serviceHistory,
			'Vehicle service history retrieved successfully',
		),
	);
});

export {
	getVehicleDetailsController,
	getVehicleServiceHistoryController,
};
