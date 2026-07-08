import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validator.js';
import {
	getVehicleDetailsController,
	getVehicleServiceHistoryController,
} from '../controllers/vehicle.controller.js';
import {
	getVehicleDetailsValidator,
	getVehicleServiceHistoryValidator,
} from '../validators/schemas/vehicle.validators.js';

const router = express.Router();

router.post(
	'/details',
	verifyJWT,
	validate(getVehicleDetailsValidator()),
	getVehicleDetailsController,
);

router.get(
	'/history/:vehicleId',
	verifyJWT,
	validate(getVehicleServiceHistoryValidator()),
	getVehicleServiceHistoryController,
);

export default router;
