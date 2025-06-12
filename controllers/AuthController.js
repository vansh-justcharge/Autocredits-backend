const { AppError } = require('../middlewares/errorHandler');
const AuthService = require('../services/AuthService');
const BaseController = require('./BaseController');

class AuthController extends BaseController {
    constructor() {
        const authService = AuthService.getInstance();
        super(authService);
    }

    register = async (req, res, next) => {
        try {
            const { user, token } = await this.service.register(req.body);

            // TODO: Send verification email

            res.status(201).json({
                status: 'success',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { user, token } = await this.service.login(email, password);

            res.status(200).json({
                status: 'success',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    };

    verifyEmail = async (req, res, next) => {
        try {
            const { token } = req.params;
            const user = await this.service.verifyEmail(token);

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };

    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const resetToken = await this.service.forgotPassword(email);

            // TODO: Send password reset email

            res.status(200).json({
                status: 'success',
                message: 'Password reset token sent to email'
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req, res, next) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            const user = await this.service.resetPassword(token, password);

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await this.service.changePassword(
                req.user.id,
                currentPassword,
                newPassword
            );

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };

    getMe = async (req, res, next) => {
        try {
            const user = await this.service.findById(req.user.id);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };

    updateMe = async (req, res, next) => {
        try {
            // Prevent password update through this route
            if (req.body.password) {
                throw new AppError(
                    'This route is not for password updates. Please use /change-password',
                    400
                );
            }

            const user = await this.service.update(req.user.id, req.body);

            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };

    getCurrentUser = async (req, res, next) => {
        try {
            res.json({
                status: 'success',
                data: { user: req.user }
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req, res, next) => {
        try {
            res.json({
                status: 'success',
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AuthController(); 