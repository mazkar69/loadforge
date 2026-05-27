import { HTTP_STATUS } from '../constants/index.js';

export const sendSuccess = (res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

export const sendError = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
    const payload = { success: false, message };
    if (errors !== null) payload.errors = errors;
    return res.status(statusCode).json(payload);
};

export const sendPaginated = (res, message = 'Success', data, pagination) => {
    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        pagination,
    });
};
