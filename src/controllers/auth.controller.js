import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import {
    getUserProfileById,
    loginUser,
    logoutUser,
    registerUser,
    resetPasswordWithRecoverySession,
    sendPasswordResetEmail,
    deleteUserByIdentifier,
    refreshAccessToken,
} from '../services/auth.service.js';

// const register = asyncHandler(async (req, res) => {
//     const {
//         email,
//         password,
//         fullName,
//         phoneNumber,
//     } = req.body;
//     const {data, error} = await supabase.auth.signUp({ email, password });
//     if (error) {
//         logger.error('Error during user registration:', error);
//         return res.json(new ApiError(
//             500,
//             {message: 'User registration failed'},
//             error
//         ));
//     }

//     await prisma.user.create({
//         data: {
//             id: data.user.id,
//             email,
//             role: UserRoles.EMPLOYEE, // Assign default role as USER
//             phoneNumber,
//             fullName,
//         },
//     });

//     return res.status(201).json(
//         new ApiResponse(
//             201,
//             {email, fullName, phoneNumber},
//             'User registered successfully'
//         )
//     );
// });

const register = asyncHandler(async (req, res) => {
    const { email, password, fullName, phoneNumber, role } = req.body;

    const user = await registerUser({
        email,
        password,
        fullName,
        phoneNumber,
        role,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, user, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await loginUser({ email, password });
    if (error) {
        logger.error('Error during user login:', error);
        return res.json(
            new ApiError(500, { message: 'User login failed' }, error),
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
            },
            'User logged in successfully',
        ),
    );
});

const logout = asyncHandler(async (req, res) => {
    const { data, error } = await logoutUser();
    if (error) {
        logger.error('Error during logout:', error);
        return res.json(
            new ApiResponse(500, { message: 'Logout failed', error }),
        );
    }

    return res.json(
        new ApiResponse(200, {
            // user: `${data.user.email}`,
            message: 'Current User logged out successfully',
        }),
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await getUserProfileById(userId);

    if (!user) {
        return res.json(
            new ApiError(
                404,
                { message: 'User not found, please login and check again' },
                new Error('Current User Not Found'),
            ),
        );
    }

    return res.json(
        new ApiResponse(200, user, 'User profile retrieved successfully'),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const { error } = await sendPasswordResetEmail(
        email,
        // , {redirectTo: `${process.env.FRONTEND_URL}/reset-password`,}
    );

    if (error) {
        throw new ApiError(400, error.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                'If an account exists, a password reset email has been sent.',
            ),
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, newPassword } = req.body;

    if (!accessToken || !refreshToken) {
        throw new ApiError(400, 'Recovery tokens are required');
    }

    if (!newPassword) {
        throw new ApiError(400, 'New password is required');
    }

    await resetPasswordWithRecoverySession({
        accessToken,
        refreshToken,
        newPassword,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, 'Password updated successfully'));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        throw new ApiError(400, 'Identifier is required');
    }
    const userDetails = await deleteUserByIdentifier(identifier);

    return res
        .status(200)
        .json(new ApiResponse(200, userDetails, 'User deleted successfully'));
});

const refreshAccessTokenController = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const tokens = await refreshAccessToken(refreshToken);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tokens,
                'Access token refreshed successfully.',
            ),
        );
});

export {
    register,
    login,
    logout,
    getUserProfile,
    forgotPassword,
    resetPassword,
    deleteUser,
    refreshAccessTokenController,
};
