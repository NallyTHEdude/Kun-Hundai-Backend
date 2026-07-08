import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
    createServiceLog,
    updateServiceLog,
    filterServiceLog,
} from '../services/serviceVisit.service.js';

const createServiceLogController = asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        entryBy: req.user.id,
    };

    const serviceLog = await createServiceLog(data);

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

const filterServiceLogController = asyncHandler(async (req, res) => {
    const filters = req.query;

    const serviceLogs = await filterServiceLog(filters);

    return res.json(
        new ApiResponse(
            200,
            serviceLogs,
            'Service logs retrieved successfully',
        ),
    );
});

export {
    createServiceLogController,
    updateServiceLogController,
    filterServiceLogController,
};
