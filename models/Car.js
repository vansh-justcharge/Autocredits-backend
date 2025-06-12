const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Customer Details
  customerName: { type: String, trim: true },
  customerContact: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },

  // Car Details from UI
  Brand: { type: String, required: [true, 'Car Brand (brand) is required'], trim: true },
  model: { type: String, required: [true, 'Car model is required'], trim: true },
  year: { type: Number, required: [true, 'Car year is required'] },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  mileage: { type: Number, required: [true, 'Mileage is required'], min: 0 },
  color: { type: String, trim: true },
  vin: { type: String, unique: true, sparse: true, trim: true },
  carNumber: { type: String, trim: true },
  condition: { type: String, enum: ['new', 'used', 'certified'], required: [true, 'Condition is required'] },
  status: { type: String, enum: ['available', 'sold', 'reserved', 'maintenance'], default: 'available' },

  // Purchase Details
  purchaseDate: { type: Date },
  paymentStatus: { type: String, enum: ['Completed', 'Pending', 'Failed'] },

  // Other fields
  features: [{ type: String, trim: true }],
  images: [{ url: String, alt: String }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
carSchema.index({ vin: 1 }, { unique: true, sparse: true });
carSchema.index({ Brand: 1, model: 1, year: 1 });
carSchema.index({ status: 1 });

// Virtual for full car name
carSchema.virtual('fullName').get(function () {
  return `${this.year} ${this.Brand} ${this.model}`;
});

// Pre-save middleware
carSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.lastUpdatedAt = new Date();
  }
  next();
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
