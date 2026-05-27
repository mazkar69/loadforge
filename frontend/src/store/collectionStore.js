import { create } from 'zustand';
import * as collectionApi from '../api/collection.api.js';

const useCollectionStore = create((set) => ({
    collections: [],
    currentCollection: null,
    pagination: null,

    fetchCollections: async (params) => {
        const { data } = await collectionApi.getCollections(params);
        set({ collections: data.data, pagination: data.pagination });
    },

    fetchCollectionById: async (id) => {
        const { data } = await collectionApi.getCollectionById(id);
        set({ currentCollection: data.data.collection });
        return data.data.collection;
    },

    createCollection: async (collectionData) => {
        const { data } = await collectionApi.createCollection(collectionData);
        set((state) => ({ collections: [data.data.collection, ...state.collections] }));
        return data.data.collection;
    },

    updateCollection: async (id, updates) => {
        const { data } = await collectionApi.updateCollection(id, updates);
        set((state) => ({
            collections: state.collections.map((c) => (c._id === id ? data.data.collection : c)),
            currentCollection: data.data.collection,
        }));
        return data.data.collection;
    },

    deleteCollection: async (id) => {
        await collectionApi.deleteCollection(id);
        set((state) => ({ collections: state.collections.filter((c) => c._id !== id) }));
    },

    importCollection: async (data) => {
        const { data: res } = await collectionApi.importCollection(data);
        set((state) => ({ collections: [res.data.collection, ...state.collections] }));
        return res.data.collection;
    },
}));

export default useCollectionStore;
