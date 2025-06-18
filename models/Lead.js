const mongoose = require("mongoose")

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number"],
    },
    status: {
      type: String,
      enum: ["new", "sold"],
      default: "new",
    },
    source: {
      type: String,
      enum: ["reference", "walk-in"],
      required: [true, "Lead source is required"],
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
    },
    interest: {
      car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
      make: String,
      model: String,
      year: Number,
      budget: {
        min: Number,
        max: Number,
      },
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastContact: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    additionalDetails: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
leadSchema.index({ email: 1 })
leadSchema.index({ phone: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ assignedTo: 1 })
leadSchema.index({ source: 1 })
leadSchema.index({ service: 1 })
leadSchema.index({ createdAt: -1 })

// Virtual for full name
leadSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Pre-save middleware
leadSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.lastStatusChange = new Date()
  }
  next()
})

// Static methods
leadSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate("assignedTo", "firstName lastName email")
}

leadSchema.statics.findByAssignedUser = function (userId) {
  return this.find({ assignedTo: userId }).sort({ nextFollowUp: 1 })
}

leadSchema.statics.findByService = function (service) {
  return this.find({ service }).populate("assignedTo", "firstName lastName email")
}

leadSchema.statics.addNote = function (leadId, noteContent, userId) {
  return this.findByIdAndUpdate(
    leadId,
    {
      $push: {
        notes: {
          content: noteContent,
          createdBy: userId,
        },
      },
      $set: { lastContact: new Date() },
    },
    { new: true },
  )
}

leadSchema.statics.updateStatus = function (leadId, newStatus, userId) {
  return this.findByIdAndUpdate(
    leadId,
    {
      $set: {
        status: newStatus,
        lastStatusChange: new Date(),
      },
      $push: {
        notes: {
          content: `Status changed to ${newStatus}`,
          createdBy: userId,
        },
      },
    },
    { new: true },
  )
}

const Lead = mongoose.model("Lead", leadSchema)

module.exports = Lead
