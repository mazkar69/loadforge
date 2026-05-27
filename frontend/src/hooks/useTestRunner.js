import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startTest as startTestApi } from '../api/test.api.js';
import useSocket from './useSocket.js';
import useTestStore from '../store/testStore.js';
import toast from 'react-hot-toast';

const useTestRunner = () => {
    const navigate = useNavigate();
    const { joinTest, leaveTest, on } = useSocket();
    const { setLiveMetrics, appendLog, setProgress, setIsRunning, resetLive } = useTestStore();
    const [testId, setTestId] = useState(null);
    const cleanupRef = useRef([]);

    const run = useCallback(
        async (testConfig) => {
            resetLive();
            setIsRunning(true);

            try {
                const { data } = await startTestApi(testConfig);
                const newTestId = data.data.testId;
                setTestId(newTestId);
                joinTest(newTestId);

                // Wire up socket events
                cleanupRef.current.push(
                    on('test:progress', (d) => {
                        appendLog(d);
                        setProgress(d.completed ? Math.round((d.completed / (d.total || 1)) * 100) : 0);
                    })
                );
                cleanupRef.current.push(
                    on('test:metrics', (d) => {
                        setLiveMetrics(d.snapshot);
                    })
                );
                cleanupRef.current.push(
                    on('test:complete', (d) => {
                        setLiveMetrics(d.metrics);
                        setIsRunning(false);
                        setProgress(100);
                        toast.success('Test completed!');
                        navigate(`/tests/${newTestId}`);
                        cleanup(newTestId);
                    })
                );
                cleanupRef.current.push(
                    on('test:error', (d) => {
                        setIsRunning(false);
                        toast.error(`Test failed: ${d.error}`);
                        cleanup(newTestId);
                    })
                );
                cleanupRef.current.push(
                    on('test:cancelled', () => {
                        setIsRunning(false);
                        toast('Test cancelled');
                        cleanup(newTestId);
                    })
                );

                return newTestId;
            } catch (err) {
                setIsRunning(false);
                toast.error(err.response?.data?.message || 'Failed to start test');
                throw err;
            }
        },
        [joinTest, on, appendLog, setLiveMetrics, setProgress, setIsRunning, resetLive, navigate]
    );

    const cleanup = useCallback(
        (tid) => {
            cleanupRef.current.forEach((fn) => fn && fn());
            cleanupRef.current = [];
            if (tid) leaveTest(tid);
        },
        [leaveTest]
    );

    return { run, testId, cleanup };
};

export default useTestRunner;
