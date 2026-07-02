import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { prisma } from '../db/database.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/api-error.js';
import { UserRolesEnum } from '../constants/user.constants.js';
import { config } from '../config/index.js';

const registerUser = async ({
    email,
    password,
    fullName,
    phoneNumber,
    role,
}) => {
    let authUserId;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw new ApiError(400, error.message);
        }

        authUserId = data.user.id;

        if (!role) {
            role = UserRolesEnum.EMPLOYEE;
        }

        await prisma.user.create({
            data: {
                id: authUserId,
                email,
                fullName,
                phoneNumber,
                role,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return {
            email,
            fullName,
            phoneNumber,
        };
    } catch (error) {
        if (authUserId) {
            try {
                await supabase.auth.admin.deleteUser(authUserId);
            } catch (cleanupError) {
                logger.error('Failed to rollback auth user', cleanupError);
            }
        }

        throw error;
    }
};

const loginUser = async ({ email, password }) => {
    return supabase.auth.signInWithPassword({ email, password });
};

const logoutUser = async () => {
    return supabase.auth.signOut();
};

const getUserProfileById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
    });
};

const sendPasswordResetEmail = async (email) => {
    return supabase.auth.resetPasswordForEmail(email);
};

const resetPasswordWithRecoverySession = async ({
    accessToken,
    refreshToken,
    newPassword,
}) => {
    const recoveryClient = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY,
    );

    const { error: sessionError } = await recoveryClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (sessionError) {
        throw new ApiError(401, sessionError.message);
    }

    const {
        data: { user },
        error: userError,
    } = await recoveryClient.auth.getUser();

    if (userError || !user) {
        throw new ApiError(401, 'Invalid or expired recovery session');
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            password: newPassword,
        },
    );

    if (updateError) {
        throw new ApiError(400, updateError.message);
    }
};

export const deleteUserByIdentifier = async (identifier) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: identifier }, { phoneNumber: identifier }],
        },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
        throw new ApiError(500, `Failed to delete user: ${error.message}`);
    }

    await prisma.user.delete({
        where: {
            id: user.id,
        },
    });

    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
    };
};

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfileById,
    sendPasswordResetEmail,
    resetPasswordWithRecoverySession,
};
