const { AppError } = require("../middlewares/errorHandler")
const Lead = require("../models/Lead")

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

    const leads = await Lead
      .find(query)
      .populate("assignedTo", "firstName lastName email")
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
    const lead = await Lead
      .findById(req.params.id)
      .populate("assignedTo", "firstName lastName email")
      .populate("notes.createdBy", "firstName lastName")

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

exports.create = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: req.user.id, // Default assign to current user
    }
    const lead = await Lead.create(leadData)
    res.status(201).json({
      status: "success",
      data: { lead },
    })
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    // Prevent updating certain fields
    const restrictedFields = ["createdAt", "createdBy"]
    restrictedFields.forEach((field) => delete req.body[field])

    const lead = await Lead
      .findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      )
      .populate("assignedTo", "firstName lastName email")
      .populate("notes.createdBy", "firstName lastName")

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
    const leads = await Lead
      .find({})
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 })

    if (format === "csv") {
      const headers = ["Name", "Email", "Phone", "Status", "Source", "Service", "Created At"]
      const csvRows = [headers.join(",")]

      leads.forEach((lead) => {
        const row = [
          `"${lead.firstName} ${lead.lastName}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.status}"`,
          `"${lead.source}"`,
          `"${lead.service || "N/A"}"`,
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
