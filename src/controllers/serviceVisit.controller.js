import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
    createServiceLog,
    updateServiceLog,
    filterServiceLog,
    getServiceLogById,
    getAllServiceLogs,
} from '../services/serviceVisit.service.js';

const createServiceLogController = asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
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

const getServiceLogByIdController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const serviceLog = await getServiceLogById(id);
   
    return res.json(
        new ApiResponse(
            200,
            serviceLog,
            'Service log retrieved successfully',
        ),
    );
});

const getAllServiceLogsController = asyncHandler(async (req, res) => {
    const serviceLogs = await getAllServiceLogs();
    return res.json(
        new ApiResponse(
            200,
            serviceLogs,
            'All service logs retrieved successfully',
        )
    );
});

export {
    createServiceLogController,
    updateServiceLogController,
    filterServiceLogController,
    getServiceLogByIdController,
    getAllServiceLogsController
};
