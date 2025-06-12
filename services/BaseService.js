const { AppError } = require('../middlewares/errorHandler');

class BaseService {
    constructor(model) {
        if (!model) {
            throw new Error('Model is required for service initialization');
        }
        this.model = model;
    }

    // Factory method for creating service instances
    static createInstance(model) {
        return new this(model);
    }

    // CRUD operations
    async create(data) {
        try {
            const instance = new this.model(data);
            return await instance.save();
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new AppError(error.message, 400);
            }
            throw new AppError(error.message || 'Error creating record', 500);
        }
    }

    async findById(id) {
        try {
            const result = await this.model.findById(id);
            if (!result) {
                throw new AppError('Record not found', 404);
            }
            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error finding record', 500);
        }
    }

    async findOne(query) {
        try {
            return await this.model.findOne(query);
        } catch (error) {
            throw new AppError(error.message || 'Error finding record', 500);
        }
    }

    async find(query, options = {}) {
        try {
            const { page = 1, limit = 50, sort = { createdAt: -1 } } = options;
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.model
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                this.model.countDocuments(query)
            ]);

            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new AppError(error.message || 'Error finding records', 500);
        }
    }

    async update(id, data) {
        try {
            const result = await this.model.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, runValidators: true }
            );
            if (!result) {
                throw new AppError('Record not found', 404);
            }
            return result;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new AppError(error.message, 400);
            }
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error updating record', 500);
        }
    }

    async delete(id) {
        try {
            const result = await this.model.findByIdAndDelete(id);
            if (!result) {
                throw new AppError('Record not found', 404);
            }
            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message || 'Error deleting record', 500);
        }
    }

    async exists(query) {
        try {
            return await this.model.exists(query);
        } catch (error) {
            throw new AppError(error.message || 'Error checking existence', 500);
        }
    }
}

module.exports = BaseService; 