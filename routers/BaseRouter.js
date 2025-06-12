const express = require('express');
const { ValidatorFactory, commonValidations } = require('../middlewares/validator');
const pagination = require('../middlewares/pagination');



//  variable working with name 


class BaseRouter {
    constructor(controller, validations = {}) {
        this.router = express.Router();
        this.controller = controller;
        this.validations = validations;
        this.initializeRoutes();
    }

    // Factory method
    static create(controller, validations) {
        return new this(controller, validations);
    }

    initializeRoutes() {
        // Apply pagination middleware to list routes
        this.router.use('/list', pagination);

        // CRUD routes with validation
        this.router.post(
            '/',
            ValidatorFactory.create(this.validations.create || []),
            this.controller.create
        );

        this.router.get(
            '/list',
            ValidatorFactory.create(this.validations.list || []),
            this.controller.find
        );

        this.router.get(
            '/:id',
            ValidatorFactory.create([
                commonValidations.id.param('id'),
                ...(this.validations.get || [])
            ]),
            this.controller.findById
        );

        this.router.put(
            '/:id',
            ValidatorFactory.create([
                commonValidations.id.param('id'),
                ...(this.validations.update || [])
            ]),
            this.controller.update
        );

        this.router.delete(
            '/:id',
            ValidatorFactory.create([
                commonValidations.id.param('id'),
                ...(this.validations.delete || [])
            ]),
            this.controller.delete
        );
    }

    getRouter() {
        return this.router;
    }
}

module.exports = BaseRouter; 