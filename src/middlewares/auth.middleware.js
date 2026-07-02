import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/api-error.js';
import { prisma } from '../db/database.js';
import { logger } from '../utils/logger.js';

export const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new ApiError(401, 'Unauthorized');
        }

        const token = authHeader.split(' ')[1];

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new ApiError(401, 'Invalid token');
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
        });

        if (!dbUser) {
            throw new ApiError(401, 'User not found');
        }

        // logger.info('VerifyJWT SAYS ROLE IS:', dbUser.role);
        req.user = dbUser;

        next();
    } catch (error) {
        next(error);
    }
};

export const verifyRole = (...roles) => {
    return (req, res, next) => {
        // logger.info("current user role: ", req.user.role);
        // logger.info("required roles: ", roles);
        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    'Forbidden, you do not have the required role',
                ),
            );
        }

        return next();
    };
};
