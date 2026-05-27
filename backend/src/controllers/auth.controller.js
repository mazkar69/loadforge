import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { HTTP_STATUS } from '../constants/index.js';

export const register = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.register(req.body);
        sendSuccess(res, 'Registration successful', { user, accessToken, refreshToken }, HTTP_STATUS.CREATED);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.login(req.body);
        sendSuccess(res, 'Login successful', { user, accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const token = req.body.refreshToken;
        const tokens = await authService.refreshTokens(token);
        sendSuccess(res, 'Tokens refreshed', tokens);
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user._id);
        sendSuccess(res, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user._id);
        sendSuccess(res, 'Profile fetched', { user });
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user._id, req.body);
        sendSuccess(res, 'Profile updated', { user });
    } catch (err) {
        next(err);
    }
};
