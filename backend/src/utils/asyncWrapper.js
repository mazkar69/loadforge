/**
 * Wraps async Express route handlers to forward errors to next().
 * @param {Function} fn - async route handler
 */
const asyncWrapper = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncWrapper;
