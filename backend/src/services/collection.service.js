import Collection from '../models/Collection.model.js';
import { HTTP_STATUS } from '../constants/index.js';
import { parsePaginationParams, buildPagination } from '../helpers/pagination.helper.js';

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

export const createCollection = async (userId, data) => {
    return Collection.create({ ...data, userId });
};

export const getCollections = async (userId, query) => {
    const { page, limit, skip } = parsePaginationParams(query);
    const [collections, total] = await Promise.all([
        Collection.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Collection.countDocuments({ userId }),
    ]);
    return { collections, pagination: buildPagination(page, limit, total) };
};

export const getCollectionById = async (id, userId) => {
    const collection = await Collection.findOne({ _id: id, userId }).lean();
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);
    return collection;
};

export const updateCollection = async (id, userId, updates) => {
    const collection = await Collection.findOneAndUpdate(
        { _id: id, userId },
        { $set: { name: updates.name, description: updates.description } },
        { new: true, runValidators: true }
    );
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);
    return collection;
};

export const deleteCollection = async (id, userId) => {
    const collection = await Collection.findOneAndDelete({ _id: id, userId });
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);
};

export const addRequest = async (collectionId, userId, requestData) => {
    const { folderId, ...reqBody } = requestData;
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);

    if (folderId) {
        const folder = collection.folders.id(folderId);
        if (!folder) throw new AppError('Folder not found', HTTP_STATUS.NOT_FOUND);
        folder.requests.push(reqBody);
    } else {
        collection.requests.push(reqBody);
    }

    await collection.save();
    return collection;
};

export const deleteRequest = async (collectionId, requestId, userId) => {
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);

    // Check top-level requests
    const topIdx = collection.requests.findIndex((r) => r._id.toString() === requestId);
    if (topIdx !== -1) {
        collection.requests.splice(topIdx, 1);
        await collection.save();
        return collection;
    }

    // Check requests in folders
    for (const folder of collection.folders) {
        const idx = folder.requests.findIndex((r) => r._id.toString() === requestId);
        if (idx !== -1) {
            folder.requests.splice(idx, 1);
            await collection.save();
            return collection;
        }
    }

    throw new AppError('Request not found', HTTP_STATUS.NOT_FOUND);
};

export const addFolder = async (collectionId, userId, folderData) => {
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);
    collection.folders.push(folderData);
    await collection.save();
    return collection;
};

export const duplicateCollection = async (collectionId, userId) => {
    const original = await Collection.findOne({ _id: collectionId, userId }).lean();
    if (!original) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);

    const { _id, createdAt, updatedAt, ...rest } = original;
    const duplicate = await Collection.create({ ...rest, name: `${rest.name} (copy)`, userId });
    return duplicate;
};

export const exportCollection = async (collectionId, userId) => {
    const collection = await Collection.findOne({ _id: collectionId, userId }).lean();
    if (!collection) throw new AppError('Collection not found', HTTP_STATUS.NOT_FOUND);
    return collection;
};

export const importCollection = async (userId, data) => {
    const { _id, createdAt, updatedAt, userId: _uid, ...rest } = data;
    return Collection.create({ ...rest, userId });
};
