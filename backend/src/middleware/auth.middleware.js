import { HTTP_STATUS } from '../constants/index.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { sendError } from '../utils/responseHandler.js';
import User from '../models/User.model.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        if (!user) {
            return sendError(res, 'User not found', HTTP_STATUS.UNAUTHORIZED);
        }
        req.user = user;
        next();
    } catch {
        return sendError(res, 'Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return sendError(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
    }
    next();
};
