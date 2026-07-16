import express from 'express';
import {
    createServiceLogController,
    updateServiceLogController,
    filterServiceLogController,
    getServiceLogByIdController,
    getAllServiceLogsController
} from '../controllers/serviceVisit.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createServiceLogValidator,
    updateServiceLogValidator,
    filterServiceLogValidator,
    getServiceLogByIdValidator,
} from '../validators/schemas/serviceVisit.validators.js';
import { validate } from '../validators/validator.js';

const router = express.Router();

router.post(
    '/create',
    verifyJWT,
    validate(createServiceLogValidator()),
    createServiceLogController,
);
router.patch(
    '/:id',
    verifyJWT,
    validate(updateServiceLogValidator()),
    updateServiceLogController,
);
router.get(
    '/filter',
    verifyJWT,
    validate(filterServiceLogValidator()),
    filterServiceLogController,
);
router.get('/all', verifyJWT, getAllServiceLogsController);

router.get('/:id', verifyJWT, validate(getServiceLogByIdValidator()), getServiceLogByIdController);

export default router;
