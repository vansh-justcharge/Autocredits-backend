const Car = require('../models/Car');
const { AppError } = require('../middlewares/errorHandler');

class CarController {
  createCar = async (req, res, next) => {
    try {
      const carData = {
        ...req.body,
        createdBy: req.user.id,
      };
      const newCar = await Car.create(carData);
      res.status(201).json({
        status: 'success',
        data: { car: newCar }
      });
    } catch (error) {
      next(error);
    }
  };

  getCars = async (req, res, next) => {
    try {
      const cars = await Car.find({}).populate('createdBy', 'firstName lastName email');
      res.status(200).json({
        status: 'success',
        data: cars
      });
    } catch (error) {
      next(error);
    }
  };

  getCarById = async (req, res, next) => {
    try {
      const car = await Car.findById(req.params.id).populate('createdBy', 'firstName lastName email');
      if (!car) {
        return next(new AppError('Car not found', 404));
      }
      res.status(200).json({
        status: 'success',
        data: { car }
      });
    } catch (error) {
      next(error);
    }
  };

  updateCar = async (req, res, next) => {
    try {
      const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      if (!updatedCar) {
        return next(new AppError('Car not found', 404));
      }
      res.status(200).json({
        status: 'success',
        data: { car: updatedCar }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCar = async (req, res, next) => {
    try {
      const deletedCar = await Car.findByIdAndDelete(req.params.id);
      if (!deletedCar) {
        return next(new AppError('Car not found', 404));
      }
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CarController();
