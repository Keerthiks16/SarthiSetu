import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  applyForJob,
  updateJob,
  updateApplicationStatus,
  deleteJob,
  getMyJobs,
  getMyApplications,
  getJobApplications,
} from "../controllers/job.controller.js";
import {
  validateJob,
  validateApplication,
} from "../middleware/validation.middleware.js";
import { protectroute } from "../middleware/protectroute.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllJobs); // Get all jobs with filters
router.get("/:id", getJobById); // Get single job by ID

// Protected routes (authentication required)
router.use(protectroute); // Apply auth middleware to all routes below

// Job management routes (for recruiters)
router.post("/", validateJob, createJob); // Create new job
router.put("/:id", validateJob, updateJob); // Update job
router.delete("/:id", deleteJob); // Delete job
router.get("/recruiter/my-jobs", getMyJobs); // Get jobs posted by current recruiter
router.get("/job/:id", getJobById);

// Application routes (for employees)
router.post("/:id/apply", validateApplication, applyForJob); // Apply for job
router.get("/employee/my-applications", getMyApplications); // Get applications by current employee

// Application management routes (for recruiters)
router.get("/:jobId/applications", getJobApplications); // Get all applications for a job
router.patch(
  "/:jobId/applications/:applicantId/status",
  updateApplicationStatus
); // Update application status

export default router;
