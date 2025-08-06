import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["recruiter", "employee", "mentor"],
      default: "employee",
      required: true,
    },

    // Recruiter-specific fields
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    // Employee-specific fields
    jobsApplied: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
          default: "pending",
        },
      },
    ],
    quizzesTaken: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        timeTaken: {
          type: Number, // in minutes
        },
      },
    ],

    // Mentor-specific fields
    mentorshipSessions: [
      {
        menteeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sessionDate: {
          type: Date,
        },
        duration: {
          type: Number, // in minutes
        },
        notes: {
          type: String,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    expertise: [
      {
        type: String, // e.g., "JavaScript", "Career Development", "Leadership"
      },
    ],
    availableForMentoring: {
      type: Boolean,
      default: false,
    },

    // Common field for all roles
    communitiesJoined: [
      {
        communityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Community",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "moderator", "admin"],
          default: "member",
        },
      },
    ],

    // Additional common fields
    profilePicture: {
      type: String, // URL to profile image
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number, // years of experience
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { email: 1 },
      { role: 1 },
      { "communitiesJoined.communityId": 1 },
    ],
  }
);

// Add methods to the schema
userSchema.methods.getJobApplicationCount = function () {
  return this.jobsApplied.length;
};

userSchema.methods.getQuizCount = function () {
  return this.quizzesTaken.length;
};

userSchema.methods.getMentorshipSessionCount = function () {
  return this.mentorshipSessions.length;
};

userSchema.methods.getCommunityCount = function () {
  return this.communitiesJoined.length;
};

// Virtual for average quiz score
userSchema.virtual("averageQuizScore").get(function () {
  if (this.quizzesTaken.length === 0) return 0;
  const totalScore = this.quizzesTaken.reduce(
    (sum, quiz) => sum + quiz.score,
    0
  );
  return Math.round(totalScore / this.quizzesTaken.length);
});

// Virtual for average mentorship rating
userSchema.virtual("averageMentorRating").get(function () {
  const ratedSessions = this.mentorshipSessions.filter(
    (session) => session.rating
  );
  if (ratedSessions.length === 0) return 0;
  const totalRating = ratedSessions.reduce(
    (sum, session) => sum + session.rating,
    0
  );
  return (totalRating / ratedSessions.length).toFixed(1);
});

const User = mongoose.model("User", userSchema);
export default User;
