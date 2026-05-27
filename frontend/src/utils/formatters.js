import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) =>
    date ? format(new Date(date), 'MMM d, yyyy HH:mm') : '—';

export const formatRelative = (date) =>
    date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '—';

export const formatDuration = (ms) => {
    if (!ms && ms !== 0) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

export const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

export const formatLatency = (ms) =>
    ms != null ? `${Math.round(ms)}ms` : '—';

export const formatPercent = (v) =>
    v != null ? `${Number(v).toFixed(1)}%` : '—';

export const formatRps = (v) =>
    v != null ? `${Number(v).toFixed(2)} req/s` : '—';

export const methodColor = (method) => {
    const map = {
        GET: 'text-green-400',
        POST: 'text-blue-400',
        PUT: 'text-yellow-400',
        PATCH: 'text-orange-400',
        DELETE: 'text-red-400',
        HEAD: 'text-purple-400',
        OPTIONS: 'text-cyan-400',
    };
    return map[method?.toUpperCase()] || 'text-gray-400';
};

export const statusColor = (status) => {
    if (!status) return 'text-gray-400';
    if (status >= 500) return 'text-red-400';
    if (status >= 400) return 'text-orange-400';
    if (status >= 300) return 'text-yellow-400';
    if (status >= 200) return 'text-green-400';
    return 'text-gray-400';
};

export const testStatusColor = (status) => {
    const map = {
        pending: 'text-yellow-400 bg-yellow-400/10',
        running: 'text-blue-400 bg-blue-400/10',
        completed: 'text-green-400 bg-green-400/10',
        failed: 'text-red-400 bg-red-400/10',
        cancelled: 'text-gray-400 bg-gray-400/10',
    };
    return map[status] || 'text-gray-400 bg-gray-400/10';
};
