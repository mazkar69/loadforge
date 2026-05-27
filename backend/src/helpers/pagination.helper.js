/**
 * Build pagination metadata from query and total count.
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
export const buildPagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

/**
 * Parse page and limit from query params with safe defaults.
 */
export const parsePaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
