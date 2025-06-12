const config = require('../config');
const { AppError } = require('./errorHandler');

const pagination = (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(
        parseInt(req.query.limit, 10) || config.pagination.defaultLimit,
        config.pagination.maxLimit
    );
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
        return next(new AppError('Invalid pagination parameters', 400));
    }

    req.pagination = {
        page,
        limit,
        skip
    };

    next();
};

module.exports = pagination; 