import User from '../models/User.model.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { HTTP_STATUS } from '../constants/index.js';

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

export const register = async ({ name, email, password }) => {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already registered', HTTP_STATUS.CONFLICT);

    const user = await User.create({ name, email, password });

    const accessToken = signAccessToken({ userId: user._id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

    const accessToken = signAccessToken({ userId: user._id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toJSON();
    return { user: userObj, accessToken, refreshToken };
};

export const refreshTokens = async (token) => {
    if (!token) throw new AppError('Refresh token required', HTTP_STATUS.UNAUTHORIZED);

    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch {
        throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
        throw new AppError('Refresh token revoked or invalid', HTTP_STATUS.UNAUTHORIZED);
    }

    const newAccessToken = signAccessToken({ userId: user._id, role: user.role });
    const newRefreshToken = signRefreshToken({ userId: user._id });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    return user;
};

export const updateProfile = async (userId, updates) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

    if (updates.name) user.name = updates.name;
    if (updates.email) {
        const exists = await User.findOne({ email: updates.email, _id: { $ne: userId } });
        if (exists) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
        user.email = updates.email;
    }
    if (updates.password) user.password = updates.password;

    await user.save();
    return user;
};
