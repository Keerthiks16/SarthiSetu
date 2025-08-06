import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      required: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
    },
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    experience: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 10,
      },
    },
    skills: [
      {
        type: String,
        required: true,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: [
            "pending",
            "reviewed",
            "shortlisted",
            "rejected",
            "hired",
            "interview",
          ],
          default: "pending",
        },
        coverLetter: {
          type: String,
        },
        resume: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    applicationDeadline: {
      type: Date,
    },
    maxApplicants: {
      type: Number,
      default: 100,
    },
    category: {
      type: String,
      enum: [
        "technology",
        "marketing",
        "sales",
        "design",
        "finance",
        "hr",
        "operations",
        "other",
      ],
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { postedBy: 1 },
      { status: 1 },
      { category: 1 },
      { skills: 1 },
      { location: 1 },
      { createdAt: -1 },
      { "applicants.userId": 1 },
    ],
  }
);

// Virtuals
jobSchema.virtual("applicantCount").get(function () {
  return this.applicants.length;
});

jobSchema.virtual("isExpired").get(function () {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Methods
jobSchema.methods.hasUserApplied = function (userId) {
  return this.applicants.some(
    (applicant) => applicant.userId.toString() === userId.toString()
  );
};

jobSchema.methods.getApplicationStatus = function (userId) {
  const application = this.applicants.find(
    (applicant) => applicant.userId.toString() === userId.toString()
  );
  return application ? application.status : null;
};

jobSchema.methods.updateApplicationStatus = function (userId, status) {
  const application = this.applicants.find(
    (applicant) => applicant.userId.toString() === userId.toString()
  );
  if (application) {
    application.status = status;
  }
  return this.save();
};

// Static methods
jobSchema.statics.findActiveJobs = function () {
  return this.find({
    status: "active",
    $or: [
      { applicationDeadline: { $gte: new Date() } },
      { applicationDeadline: null },
    ],
  });
};

jobSchema.statics.findJobsBySkills = function (skills) {
  return this.find({
    skills: { $in: skills },
    status: "active",
  });
};

const Job = mongoose.model("Job", jobSchema);
export default Job;
