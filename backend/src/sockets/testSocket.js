/**
 * testSocket.js — Socket.IO setup for real-time test event streaming.
 *
 * Exposes `initTestSocket(io)` to attach the /tests namespace.
 * Also exports `getEmitter(testId)` for the test service to push events.
 */

import logger from '../utils/logger.js';

// Map of testId -> Set of socket IDs in that room
// Used to track active listeners (informational only)

let ioInstance = null;

export const initTestSocket = (io) => {
    ioInstance = io;

    const testNs = io.of('/tests');

    testNs.on('connection', (socket) => {
        logger.debug(`Socket connected: ${socket.id}`);

        socket.on('join-test', (testId) => {
            if (!testId) return;
            socket.join(testId);
            logger.debug(`Socket ${socket.id} joined room: ${testId}`);
        });

        socket.on('leave-test', (testId) => {
            if (!testId) return;
            socket.leave(testId);
        });

        socket.on('disconnect', () => {
            logger.debug(`Socket disconnected: ${socket.id}`);
        });
    });

    return testNs;
};

/**
 * Returns an emit function scoped to a specific testId room.
 * Used by test.service to broadcast events without directly importing socket.
 */
export const getEmitter = (testId) => {
    return (event, data) => {
        if (!ioInstance) return;
        ioInstance.of('/tests').to(testId).emit(event, data);
    };
};
