import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createServiceLog } from '../services/serviceVisit.service.js';

const createServiceLogController = asyncHandler(async (req, res) => {
    const {
        vehicleNumber,
        vehicleType,
        customerName,
        customerPhoneNumber,
        customerAddress,
        kilometersDriven,
        serviceType,
        serviceStatus,
        description,
        scheduledAt,
    } = req.body;

    const serviceLog = await createServiceLog({
        vehicleNumber,
        vehicleType,
        customerName,
        customerPhoneNumber,
        customerAddress,
        kilometersDriven,
        serviceType,
        serviceStatus,
        description,
        scheduledAt,
        entryBy: req.user.id,
    });

    if (!serviceLog) {
        throw new ApiError(500, 'Failed to create service log');
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                serviceLog,
                'Service log created successfully',
            ),
        );
});

const updateServiceLogController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const serviceLog = await updateServiceLog(id, req.body);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serviceLog,
                'Service log updated successfully',
            ),
        );
});

export { createServiceLogController, updateServiceLogController };
