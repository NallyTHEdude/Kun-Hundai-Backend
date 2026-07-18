import express from 'express';
import {
    register,
    login,
    logout,
    getUserProfile,
    forgotPassword,
    resetPassword,
    deleteUser,
    refreshAccessTokenController,
} from '../controllers/auth.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { UserRolesEnum } from '../constants/user.constants.js';
import { validate } from '../validators/validator.js';
import {
    registerUserValidator,
    loginUserValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    deleteUserValidator,
    refreshAccessTokenValidator,
} from '../validators/schemas/auth.validators.js';

const router = express.Router();

// insecure routes
router.post('/register', validate(registerUserValidator()), register);
router.post('/login', validate(loginUserValidator()), login);
router.post('/logout', logout);
router.post(
    '/forgot-password',
    validate(forgotPasswordValidator()),
    forgotPassword,
);
router.post(
    '/reset-password',
    validate(resetPasswordValidator()),
    resetPassword,
);
router.post("/refresh-access-token", validate(refreshAccessTokenValidator()), refreshAccessTokenController);

// secure auth route
router.get('/profile', verifyJWT, getUserProfile);
router.delete(
    '/delete',
    verifyJWT,
    verifyRole(UserRolesEnum.ADMIN),
    deleteUser,
);

export default router;
