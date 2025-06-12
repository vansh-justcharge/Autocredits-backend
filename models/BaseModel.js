const mongoose = require('mongoose');

class BaseModel {
    constructor(schema) {
        this.schema = schema;
        this.model = mongoose.model(this.constructor.name, schema);
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async findOne(query) {
        return this.model.findOne(query);
    }

    async find(query, options = {}) {
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
    }

    async create(data) {
        const instance = new this.model(data);
        return instance.save();
    }

    async update(id, data) {
        return this.model.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return this.model.findByIdAndDelete(id);
    }

    async exists(query) {
        return this.model.exists(query);
    }
}

module.exports = BaseModel; 