import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        url: { type: String, required: true, trim: true },
        method: {
            type: String,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
            default: 'GET',
            uppercase: true,
        },
        headers: { type: Map, of: String, default: {} },
        queryParams: { type: Map, of: String, default: {} },
        body: { type: mongoose.Schema.Types.Mixed, default: null },
        bodyType: { type: String, enum: ['none', 'json', 'raw', 'form-data'], default: 'none' },
        auth: {
            type: { type: String, enum: ['none', 'bearer', 'basic', 'api-key'], default: 'none' },
            token: String,
            username: String,
            password: String,
            key: String,
            value: String,
        },
        description: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    requests: [requestSchema],
});

const collectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        folders: [folderSchema],
        requests: [requestSchema], // top-level requests (not in any folder)
    },
    { timestamps: true }
);

collectionSchema.index({ userId: 1, createdAt: -1 });

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
