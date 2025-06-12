const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { auth, restrictTo } = require('../middlewares/auth');

// Public routes
router.get('/', carController.getCars);
router.get('/:id', carController.getCarById);

// Protected routes
router.use(auth);

// Admin only routes
router.use(restrictTo('admin'));

router.post('/', carController.createCar);
router.patch('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;


