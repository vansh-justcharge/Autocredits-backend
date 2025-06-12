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

module.exports = auth; 