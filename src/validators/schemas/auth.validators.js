import { body } from 'express-validator';
import { UserRoles } from '../../constants/user.constants.js';

const registerUserValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is not valid'),

        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain an uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain a lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain a number'),

        body('fullName')
            .trim()
            .notEmpty()
            .withMessage('Full name is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Full name must be between 3 and 50 characters'),

        body('phoneNumber')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .matches(/^\+?\d{10,10}$/)
            .withMessage('Phone number is not valid for india'),

        body('role')
            .notEmpty()
            .withMessage('Role is required')
            .isIn(UserRoles)
            .withMessage("Role must be either 'EMPLOYEE' or 'ADMIN'"),
    ];
};

const loginUserValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is not valid'),

        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain an uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain a lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain a number'),
    ];
};

const forgotPasswordValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Email is not valid'),
    ];
};

const resetPasswordValidator = () => {
    return [
        body('newPassword')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain an uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain a lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain a number'),

        body('accessToken')
            .trim()
            .notEmpty()
            .withMessage('Access token is required'),

        body('refreshToken')
            .trim()
            .notEmpty()
            .withMessage('Refresh token is required'),
    ];
};

const deleteUserValidator = () => {
    return [
        body('identifier')
            .trim()
            .notEmpty()
            .withMessage('Identifier is required')
            .custom((value) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

                const isPhone = /^(\+91)?[6-9]\d{9}$/.test(value);

                if (!(isEmail || isPhone)) {
                    throw new Error(
                        'Identifier must be a valid email or phone number',
                    );
                }

                return true;
            }),
    ];
};

export {
    registerUserValidator,
    loginUserValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    deleteUserValidator,
};
