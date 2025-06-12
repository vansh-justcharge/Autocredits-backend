const { AppError } = require('./errorHandler');
const AuthService = require('../services/AuthService');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new AppError('No token provided', 401);
        }

        // Verify token and get user
        const user = await AuthService.getInstance().verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

module.exports = {
    auth,
    restrictTo
}; 