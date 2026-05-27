import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

const getSocket = () => {
    if (!socketInstance) {
        socketInstance = io('/tests', {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });
    }
    return socketInstance;
};

const useSocket = () => {
    const socketRef = useRef(getSocket());

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket.connected) socket.connect();
        return () => {
            // Don't disconnect on unmount — shared singleton
        };
    }, []);

    const joinTest = useCallback((testId) => {
        socketRef.current.emit('join-test', testId);
    }, []);

    const leaveTest = useCallback((testId) => {
        socketRef.current.emit('leave-test', testId);
    }, []);

    const on = useCallback((event, handler) => {
        socketRef.current.on(event, handler);
        return () => socketRef.current.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        socketRef.current.off(event, handler);
    }, []);

    return { socket: socketRef.current, joinTest, leaveTest, on, off };
};

export default useSocket;
