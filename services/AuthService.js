const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const BaseService = require('./BaseService');
const bcrypt = require('bcryptjs');

class AuthService extends BaseService {
    constructor() {
        super(User);
    }

    static getInstance() {
        return new AuthService();
    }

    async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await this.findOne({ email: userData.email });
            if (existingUser) {
                throw new AppError('User already exists', 400);
            }

            // Create user (password will be hashed by the User model's pre-save hook)
            const user = await this.create(userData);

            // Generate token
            const token = this.generateToken(user);

            return {
                user: this.sanitizeUser(user),
                token
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error registering user', 500);
        }
    }

    async login(email, password) {
        try {
            // Find user and explicitly select password field
            const user = await this.model.findOne({ email }).select('+password');
            if (!user) {
                throw new AppError('Invalid credentials', 401);
            }

            // Check password using the User model's comparePassword method
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new AppError('Invalid credentials', 401);
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = this.generateToken(user);

            return {
                user: this.sanitizeUser(user),
                token
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error logging in', 500);
        }
    }

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            const user = await this.findById(decoded.id);
            if (!user) {
                throw new AppError('User not found', 404);
            }
            return this.sanitizeUser(user);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid token', 401);
            }
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token expired', 401);
            }
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error verifying token', 500);
        }
    }

    async verifyEmail(token) {
        try {
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            const user = await this.findOne({
                emailVerificationToken: hashedToken,
                emailVerified: false
            });

            if (!user) {
                throw new AppError('Invalid or expired verification token', 400);
            }

            user.emailVerified = true;
            user.emailVerificationToken = undefined;
            await user.save();

            return this.sanitizeUser(user);
        } catch (error) {
            throw new AppError(error.message, error.statusCode || 500);
        }
    }

    async forgotPassword(email) {
        try {
            const user = await this.findOne({ email });
            if (!user) {
                throw new AppError('No user found with that email address', 404);
            }

            const resetToken = user.generatePasswordResetToken();
            await user.save();

            return resetToken;
        } catch (error) {
            throw new AppError(error.message, error.statusCode || 500);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            const user = await this.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new AppError('Invalid or expired password reset token', 400);
            }

            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            return this.sanitizeUser(user);
        } catch (error) {
            throw new AppError(error.message, error.statusCode || 500);
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.model.findById(userId).select('+password');
            if (!user) {
                throw new AppError('User not found', 404);
            }

            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                throw new AppError('Current password is incorrect', 401);
            }

            user.password = newPassword;
            await user.save();

            return this.sanitizeUser(user);
        } catch (error) {
            throw new AppError(error.message, error.statusCode || 500);
        }
    }

    generateToken(user) {
        return jwt.sign(
            { id: user._id },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    sanitizeUser(user) {
        const sanitized = user.toObject();
        delete sanitized.password;
        return sanitized;
    }
}

module.exports = AuthService; 