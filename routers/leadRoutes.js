const express = require("express")
const { body } = require("express-validator")
const { ValidatorFactory } = require("../middlewares/validator")
const { getLeads, getLeadById, create, update, delete: deleteLead, addNote, updateStatus, exportLeads } = require("../controllers/LeadController")
const { auth, restrictTo } = require("../middlewares/auth")

const router = express.Router()

// Validation schema
const leadSchema = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("source").notEmpty().withMessage("Source is required"),
    body("service").notEmpty().withMessage("Service is required"),
]

// Public routes
router.get("/", getLeads)
router.get("/export", exportLeads)
router.get("/:id", getLeadById)

// Protected routes
router.use(auth)

// Admin only routes
router.use(restrictTo("admin"))

// Lead routes
router.post("/", ValidatorFactory.create(leadSchema), create)
router.patch("/:id", ValidatorFactory.create(leadSchema.map((validation) => validation.optional())), update)
router.delete("/:id", deleteLead)

// Lead notes and status
router.post("/:id/notes", addNote)
router.patch("/:id/status", updateStatus)

module.exports = router
