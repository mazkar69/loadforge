import { create } from 'zustand';
import * as testApi from '../api/test.api.js';

const useTestStore = create((set, get) => ({
    tests: [],
    currentTest: null,
    pagination: null,
    liveMetrics: null,
    liveLog: [],
    isRunning: false,
    progress: 0,

    fetchTests: async (params) => {
        const { data } = await testApi.getTests(params);
        set({ tests: data.data, pagination: data.pagination });
        return data;
    },

    fetchTestById: async (id) => {
        const { data } = await testApi.getTestById(id);
        set({ currentTest: data.data.test });
        return data.data.test;
    },

    deleteTest: async (id) => {
        await testApi.deleteTest(id);
        set((state) => ({ tests: state.tests.filter((t) => t._id !== id) }));
    },

    cancelTest: async (id) => {
        await testApi.cancelTest(id);
    },

    setLiveMetrics: (metrics) => set({ liveMetrics: metrics }),
    appendLog: (entry) => set((state) => ({ liveLog: [...state.liveLog.slice(-499), entry] })),
    setProgress: (p) => set({ progress: p }),
    setIsRunning: (v) => set({ isRunning: v }),

    resetLive: () => set({ liveMetrics: null, liveLog: [], progress: 0, isRunning: false }),
}));

export default useTestStore;
