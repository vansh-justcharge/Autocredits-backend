const { AppError } = require("../middlewares/errorHandler")
const Lead = require("../models/Lead")
const mongoose = require("mongoose")

exports.getLeads = async (req, res, next) => {
  try {
    const { status, assignedTo, source, service, page = 1, limit = 10 } = req.query
    const query = {}

    // Build query based on filters
    if (status) query.status = status
    if (assignedTo) query.assignedTo = assignedTo
    if (source) query.source = source
    if (service) query.service = service

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const leads = await Lead.find(query)
      .populate("assignedTo", "firstName lastName email name", null, { strictPopulate: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Lead.countDocuments(query)
    const totalPages = Math.ceil(total / Number.parseInt(limit))

    res.status(200).json({
      status: "success",
      data: {
        leads: {
          data: leads,
          total,
          page: Number.parseInt(page),
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email name", null, { strictPopulate: false })
      .populate("notes.createdBy", "firstName lastName")

    if (!lead) {
      throw new AppError("Lead not found", 404)
    }

    console.log("Retrieved lead:", JSON.stringify(lead, null, 2))
    console.log("AssignedTo field:", lead.assignedTo)

    res.status(200).json({
      status: "success",
      data: { lead },
    })
  } catch (error) {
    next(error)
  }
}

exports.create = async (req, res, next) => {
  try {
    console.log("=== CREATE LEAD DEBUG ===")
    console.log("Request body:", JSON.stringify(req.body, null, 2))

    const leadData = { ...req.body }

    // Handle assignedTo field - validate if it's a valid ObjectId format
    console.log("Raw assignedTo value:", leadData.assignedTo, "Type:", typeof leadData.assignedTo)

    if (
      leadData.assignedTo &&
      leadData.assignedTo.toString().trim() !== "" &&
      leadData.assignedTo !== "null" &&
      leadData.assignedTo !== "undefined"
    ) {
      const assignedToString = leadData.assignedTo.toString().trim()
      console.log("Processing assignedTo string:", assignedToString)

      if (!mongoose.Types.ObjectId.isValid(assignedToString)) {
        console.log("❌ Invalid assignedTo ObjectId:", assignedToString)
        throw new AppError("Invalid assignedTo user ID", 400)
      }
      console.log("✅ Valid assignedTo ObjectId:", assignedToString)

      // Convert to ObjectId
      leadData.assignedTo = new mongoose.Types.ObjectId(assignedToString)
      console.log("✅ Converted to ObjectId:", leadData.assignedTo)
    } else {
      console.log("ℹ️ No valid assignedTo provided, setting to null")
      console.log("Original value was:", leadData.assignedTo)
      leadData.assignedTo = null
    }

    // Handle lastContact field - convert to Date if provided
    if (leadData.lastContact && leadData.lastContact.trim() !== "") {
      leadData.lastContact = new Date(leadData.lastContact)
      console.log("✅ Last contact date:", leadData.lastContact)
    } else {
      leadData.lastContact = null
    }

    console.log("Final lead data before save:", JSON.stringify(leadData, null, 2))

    const lead = await Lead.create(leadData)
    console.log("✅ Lead created with ID:", lead._id)
    console.log("Raw lead assignedTo after save:", lead.assignedTo)

    // Populate the created lead before sending response
    const populatedLead = await Lead.findById(lead._id).populate("assignedTo", "firstName lastName email name", null, {
      strictPopulate: false,
    })

    console.log("✅ Populated lead:", JSON.stringify(populatedLead, null, 2))
    console.log("Populated assignedTo:", populatedLead.assignedTo)

    res.status(201).json({
      status: "success",
      data: { lead: populatedLead },
    })
  } catch (error) {
    console.error("❌ Create lead error:", error)
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    console.log("=== UPDATE LEAD DEBUG ===")
    console.log("Lead ID:", req.params.id)
    console.log("Request body:", JSON.stringify(req.body, null, 2))

    // Prevent updating certain fields
    const restrictedFields = ["createdAt", "createdBy"]
    restrictedFields.forEach((field) => delete req.body[field])

    const updateData = { ...req.body }

    // Handle assignedTo field validation
    console.log("Raw assignedTo value:", updateData.assignedTo, "Type:", typeof updateData.assignedTo)

    if (updateData.assignedTo !== undefined) {
      if (
        updateData.assignedTo &&
        updateData.assignedTo.toString().trim() !== "" &&
        updateData.assignedTo !== "null" &&
        updateData.assignedTo !== "undefined"
      ) {
        const assignedToString = updateData.assignedTo.toString().trim()
        console.log("Processing assignedTo string:", assignedToString)

        if (!mongoose.Types.ObjectId.isValid(assignedToString)) {
          console.log("❌ Invalid assignedTo ObjectId:", assignedToString)
          throw new AppError("Invalid assignedTo user ID", 400)
        }
        console.log("✅ Valid assignedTo ObjectId:", assignedToString)
        updateData.assignedTo = new mongoose.Types.ObjectId(assignedToString)
        console.log("✅ Converted to ObjectId:", updateData.assignedTo)
      } else {
        console.log("ℹ️ Clearing assignedTo field")
        console.log("Original value was:", updateData.assignedTo)
        updateData.assignedTo = null
      }
    }

    // Handle lastContact field - convert to Date if provided
    if (updateData.lastContact !== undefined) {
      if (updateData.lastContact && updateData.lastContact.trim() !== "") {
        updateData.lastContact = new Date(updateData.lastContact)
        console.log("✅ Last contact date:", updateData.lastContact)
      } else {
        updateData.lastContact = null
      }
    }

    console.log("Final update data:", JSON.stringify(updateData, null, 2))

    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true })
      .populate("assignedTo", "firstName lastName email name", null, { strictPopulate: false })
      .populate("notes.createdBy", "firstName lastName")

    if (!lead) {
      throw new AppError("Lead not found", 404)
    }

    console.log("✅ Updated lead:", JSON.stringify(lead, null, 2))
    console.log("Updated assignedTo:", lead.assignedTo)

    res.status(200).json({
      status: "success",
      data: { lead },
    })
  } catch (error) {
    console.error("❌ Update lead error:", error)
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id)
    if (!lead) {
      throw new AppError("Lead not found", 404)
    }
    res.status(204).json({ status: "success", data: null })
  } catch (error) {
    next(error)
  }
}

exports.addNote = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const lead = await Lead.addNote(id, content, req.user.id)

    if (!lead) {
      throw new AppError("Lead not found", 404)
    }

    res.status(200).json({
      status: "success",
      data: { lead },
    })
  } catch (error) {
    next(error)
  }
}

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const lead = await Lead.updateStatus(id, status, req.user.id)

    if (!lead) {
      throw new AppError("Lead not found", 404)
    }

    res.status(200).json({
      status: "success",
      data: { lead },
    })
  } catch (error) {
    next(error)
  }
}

exports.exportLeads = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query
    const leads = await Lead.find({})
      .populate("assignedTo", "firstName lastName email name", null, { strictPopulate: false })
      .sort({ createdAt: -1 })

    if (format === "csv") {
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Status",
        "Source",
        "Service",
        "Assigned To",
        "Last Contact",
        "Additional Details",
        "Created At",
      ]
      const csvRows = [headers.join(",")]

      leads.forEach((lead) => {
        let assignedToName = "Not assigned"
        if (lead.assignedTo) {
          if (lead.assignedTo.firstName && lead.assignedTo.lastName) {
            assignedToName = `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
          } else if (lead.assignedTo.name) {
            assignedToName = lead.assignedTo.name
          }
        }

        const lastContact = lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : "No contact"

        const row = [
          `"${lead.firstName} ${lead.lastName}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.status}"`,
          `"${lead.source}"`,
          `"${lead.service || "N/A"}"`,
          `"${assignedToName}"`,
          `"${lastContact}"`,
          `"${lead.additionalDetails || "None"}"`,
          `"${new Date(lead.createdAt).toLocaleDateString()}"`,
        ]
        csvRows.push(row.join(","))
      })

      const csv = csvRows.join("\n")
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv")
      res.send(csv)
    } else {
      res.status(400).json({
        status: "error",
        message: "Unsupported export format",
      })
    }
  } catch (error) {
    next(error)
  }
}
