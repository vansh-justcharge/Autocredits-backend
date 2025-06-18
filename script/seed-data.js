require("dotenv").config()
const mongoose = require("mongoose")

// Lead Schema (same as your model)
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

// Create Lead model
const Lead = mongoose.model("Lead", leadSchema)

// User Schema for creating a default user
const userSchema = new mongoose.Schema(
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
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["user", "admin", "manager"],
            default: "user",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

const User = mongoose.model("User", userSchema)

// Sample leads data
const sampleLeads = [
    {
        firstName: "Aarav",
        lastName: "Sharma",
        email: "aarav.sharma@email.com",
        phone: "+91 98765 43210",
        status: "new",
        source: "walk-in",
        service: "Insurance",
        additionalDetails: "Follow-up needed",
        tags: ["high-priority"],
        lastContact: new Date("2023-10-01"),
        nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Isha",
        lastName: "Kapoor",
        email: "isha.kapoor@email.com",
        phone: "+91 87654 32109",
        status: "contacted",
        source: "walk-in",
        service: "Loan",
        additionalDetails: "Interested in personal loan",
        tags: ["loan-inquiry"],
        lastContact: new Date("2023-09-28"),
        nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Rohan",
        lastName: "Mehta",
        email: "rohan.mehta@email.com",
        phone: "+91 76543 21098",
        status: "qualified",
        source: "walk-in",
        service: "Car Buy",
        additionalDetails: "Looking for SUV",
        tags: ["qualified", "car-buyer"],
        interest: {
            make: "SUV",
            budget: { min: 500000, max: 800000 },
        },
        lastContact: new Date("2023-10-02"),
        nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Diya",
        lastName: "Singh",
        email: "diya.singh@email.com",
        phone: "+91 65432 10987",
        status: "proposal",
        source: "referral",
        service: "Car Sold",
        additionalDetails: "Ready to sell sedan",
        tags: ["referral", "car-seller"],
        lastContact: new Date("2023-09-30"),
        nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Karan",
        lastName: "Joshi",
        email: "karan.joshi@email.com",
        phone: "+91 54321 09876",
        status: "negotiation",
        source: "referral",
        service: "Car Buy",
        additionalDetails: "Price negotiation ongoing",
        tags: ["negotiation", "budget-conscious"],
        interest: {
            make: "Sedan",
            budget: { min: 300000, max: 500000 },
        },
        lastContact: new Date("2023-10-01"),
        nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Vikram",
        lastName: "Rao",
        email: "vikram.rao@email.com",
        phone: "+91 43210 98765",
        status: "closed",
        source: "walk-in",
        service: "Insurance",
        additionalDetails: "Policy purchased",
        tags: ["closed-won", "insurance"],
        lastContact: new Date("2023-09-25"),
    },
    {
        firstName: "Anaya",
        lastName: "Verma",
        email: "anaya.verma@email.com",
        phone: "+91 32109 87654",
        status: "new",
        source: "walk-in",
        service: "Car Buy",
        additionalDetails: "First time buyer",
        tags: ["new-lead"],
        nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Arjun",
        lastName: "Nair",
        email: "arjun.nair@email.com",
        phone: "+91 21098 76543",
        status: "contacted",
        source: "walk-in",
        service: "Car Sold",
        additionalDetails: "Wants quick sale",
        tags: ["contacted", "car-seller"],
        lastContact: new Date("2023-09-29"),
        nextFollowUp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Priya",
        lastName: "Patel",
        email: "priya.patel@email.com",
        phone: "+91 11111 22222",
        status: "qualified",
        source: "website",
        service: "Insurance",
        additionalDetails: "Health insurance inquiry",
        tags: ["website-lead", "health-insurance"],
        lastContact: new Date("2023-10-03"),
        nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
        firstName: "Rahul",
        lastName: "Kumar",
        email: "rahul.kumar@email.com",
        phone: "+91 33333 44444",
        status: "proposal",
        source: "phone",
        service: "Loan",
        additionalDetails: "Home loan application",
        tags: ["phone-inquiry", "home-loan"],
        lastContact: new Date("2023-10-04"),
        nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
]

// Default user data
const defaultUser = {
    firstName: "Inshra",
    lastName: "Fatma",
    email: "inshra.fatma@company.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // password: "password123"
    role: "admin",
    isActive: true,
}

// Connect to MongoDB and seed data
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/autocredits", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        // Clear existing data
        await Lead.deleteMany({})
        await User.deleteMany({})

        // Create default user
        const user = await User.create(defaultUser)

        // Add assignedTo field to leads
        const leadsWithAssignment = sampleLeads.map((lead) => ({
            ...lead,
            assignedTo: user._id,
        }))

        // Insert sample leads
        const createdLeads = await Lead.insertMany(leadsWithAssignment)
        createdLeads.forEach((lead, index) => {
            console.log(`${index + 1}. ${lead.firstName} ${lead.lastName} - ${lead.service} (${lead.status})`)
        })
    } catch (error) {
        console.error("Error seeding database:", error)
    } finally {
        // Close connection
        await mongoose.connection.close()
        console.log("\n Database connection closed")
        process.exit(0)
    }
}

// Run the seed function
seedDatabase()
