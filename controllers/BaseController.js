const { AppError } = require('../middlewares/errorHandler');

class BaseController {
    constructor(service) {
        if (!service) {
            throw new Error('Service is required for controller initialization');
        }
        this.service = service;
    }

    // Factory method
    static create(service) {
        return new this(service);
    }

    // CRUD operations
    create = async (req, res, next) => {
        try {
            const data = await this.service.create(req.body);
            res.status(201).json({
                status: 'success',
                data
            });
        } catch (error) {
            next(error);
        }
    };

    findById = async (req, res, next) => {
        try {
            const data = await this.service.findById(req.params.id);
            if (!data) {
                throw new AppError('Resource not found', 404);
            }
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (error) {
            next(error);
        }
    };

    find = async (req, res, next) => {
        try {
            const { page, limit } = req.pagination || {};
            const data = await this.service.find(req.query, { page, limit });
            res.status(200).json({
                status: 'success',
                ...data
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const data = await this.service.update(req.params.id, req.body);
            if (!data) {
                throw new AppError('Resource not found', 404);
            }
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            const data = await this.service.delete(req.params.id);
            if (!data) {
                throw new AppError('Resource not found', 404);
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = BaseController; 