import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { extractVehicleNumber } from '../services/ocr.service.js';

const extractVehicleNumberController = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Image is required.');
    }

    const result = await extractVehicleNumber(req.file.buffer);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                'Vehicle number extracted successfully.',
            ),
        );
});

export { extractVehicleNumberController };
