import * as collectionService from '../services/collection.service.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.createCollection(req.user._id, req.body);
        sendSuccess(res, 'Collection created', { collection }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
};

export const getCollections = async (req, res, next) => {
    try {
        const { collections, pagination } = await collectionService.getCollections(req.user._id, req.query);
        sendPaginated(res, 'Collections fetched', collections, pagination);
    } catch (err) { next(err); }
};

export const getCollectionById = async (req, res, next) => {
    try {
        const collection = await collectionService.getCollectionById(req.params.id, req.user._id);
        sendSuccess(res, 'Collection fetched', { collection });
    } catch (err) { next(err); }
};

export const updateCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.updateCollection(req.params.id, req.user._id, req.body);
        sendSuccess(res, 'Collection updated', { collection });
    } catch (err) { next(err); }
};

export const deleteCollection = async (req, res, next) => {
    try {
        await collectionService.deleteCollection(req.params.id, req.user._id);
        sendSuccess(res, 'Collection deleted');
    } catch (err) { next(err); }
};

export const addRequest = async (req, res, next) => {
    try {
        const collection = await collectionService.addRequest(req.params.id, req.user._id, req.body);
        sendSuccess(res, 'Request added', { collection }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
};

export const deleteRequest = async (req, res, next) => {
    try {
        const collection = await collectionService.deleteRequest(req.params.id, req.params.requestId, req.user._id);
        sendSuccess(res, 'Request deleted', { collection });
    } catch (err) { next(err); }
};

export const addFolder = async (req, res, next) => {
    try {
        const collection = await collectionService.addFolder(req.params.id, req.user._id, req.body);
        sendSuccess(res, 'Folder added', { collection }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
};

export const duplicateCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.duplicateCollection(req.params.id, req.user._id);
        sendSuccess(res, 'Collection duplicated', { collection }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
};

export const exportCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.exportCollection(req.params.id, req.user._id);
        res.setHeader('Content-Disposition', `attachment; filename="collection-${req.params.id}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(collection);
    } catch (err) { next(err); }
};

export const importCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.importCollection(req.user._id, req.body);
        sendSuccess(res, 'Collection imported', { collection }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
};
