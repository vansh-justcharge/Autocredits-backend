const express = require('express');
const { body } = require('express-validator');
const { ValidatorFactory } = require('../middlewares/validator');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Validation schemas
const registerSchema = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
];

const loginSchema = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordSchema = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('New password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain a lowercase letter')
];

// Public routes
router.post(
  '/register',
  ValidatorFactory.create(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  ValidatorFactory.create(loginSchema),
  AuthController.login
);

router.get(
  '/verify-email/:token',
  AuthController.verifyEmail
);

router.post(
  '/forgot-password',
  ValidatorFactory.create([
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
  ]),
  AuthController.forgotPassword
);

router.post(
  '/reset-password/:token',
  ValidatorFactory.create([
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
  ]),
  AuthController.resetPassword
);

// Protected routes
router.use(auth);

router.get('/me', AuthController.getMe);

router.patch(
  '/update-me',
  ValidatorFactory.create([
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty')
  ]),
  AuthController.updateMe
);

router.post(
  '/change-password',
  ValidatorFactory.create(changePasswordSchema),
  AuthController.changePassword
);

module.exports = router;