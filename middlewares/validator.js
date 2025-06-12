const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

class ValidatorFactory {
    static create(schema) {
        return async (req, res, next) => {
            try {
                await Promise.all(schema.map(validation => validation.run(req)));

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const errorMessages = errors.array().map(err => err.msg);
                    throw new AppError(errorMessages.join(', '), 400);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }
}

// Common validation schemas
const commonValidations = {
    id: {
        param: (field) => ({
            param: field,
            isMongoId: true,
            errorMessage: 'Invalid ID format'
        })
    },
    pagination: {
        query: () => ({
            page: {
                optional: true,
                isInt: {
                    options: { min: 1 },
                    errorMessage: 'Page must be a positive integer'
                }
            },
            limit: {
                optional: true,
                isInt: {
                    options: { min: 1, max: 100 },
                    errorMessage: 'Limit must be between 1 and 100'
                }
            }
        })
    }
};

module.exports = {
    ValidatorFactory,
    commonValidations
}; 