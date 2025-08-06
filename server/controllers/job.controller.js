import Job from "../models/job.model.js";
import User from "../models/user.model.js";

// Create a new job (Recruiter only)
export const createJob = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findById(userId);

    if (user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can post jobs",
      });
    }

    const jobData = {
      ...req.body,
      postedBy: userId,
    };

    const job = new Job(jobData);
    await job.save();

    // Add job to user's jobsPosted array
    user.jobsPosted.push(job._id);
    await user.save();

    await job.populate("postedBy", "name email company");

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Get all jobs with filtering and pagination
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      jobType,
      workMode,
      category,
      skills,
      minSalary,
      maxSalary,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { status: "active" };

    // Add filters
    if (location) query.location = new RegExp(location, "i");
    if (jobType) query.jobType = jobType;
    if (workMode) query.workMode = workMode;
    if (category) query.category = category;
    if (skills) query.skills = { $in: skills.split(",") };
    if (minSalary) query["salary.min"] = { $gte: parseInt(minSalary) };
    if (maxSalary) query["salary.max"] = { $lte: parseInt(maxSalary) };
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-applicants"); // Don't show applicants in list view

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const job = await Job.findById(id)
      .populate("postedBy", "name email company profilePicture")
      .populate(
        "applicants.userId",
        "name email profilePicture skills experience"
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    // Check if current user has applied (if logged in)
    let hasApplied = false;
    let applicationStatus = null;
    if (userId) {
      hasApplied = job.hasUserApplied(userId);
      applicationStatus = job.getApplicationStatus(userId);
    }

    const jobData = job.toObject();

    // Hide applicant details if user is not the recruiter who posted the job
    if (!userId || job.postedBy._id.toString() !== userId) {
      jobData.applicants = jobData.applicants.map((app) => ({
        appliedAt: app.appliedAt,
        status: app.status,
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        ...jobData,
        hasApplied,
        applicationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

// Apply for a job (Employee only)
export const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { coverLetter, resume } = req.body;

    const user = await User.findById(userId);
    if (user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can apply for jobs",
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    if (job.isExpired) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    if (job.hasUserApplied(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    if (job.applicants.length >= job.maxApplicants) {
      return res.status(400).json({
        success: false,
        message: "Maximum number of applications reached",
      });
    }

    // Add application to job
    job.applicants.push({
      userId,
      coverLetter,
      resume,
      appliedAt: new Date(),
      status: "pending",
    });
    await job.save();

    // Add application to user's jobsApplied array
    user.jobsApplied.push({
      jobId: job._id,
      appliedAt: new Date(),
      status: "pending",
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error applying for job",
      error: error.message,
    });
  }
};

// Update job (Recruiter only - own jobs)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own job posts",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("postedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// Update application status (Recruiter only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own job posts",
      });
    }

    const application = job.applicants.find(
      (app) => app.userId.toString() === applicantId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;
    await job.save();

    // Update status in user's jobsApplied array
    const applicant = await User.findById(applicantId);
    const userApplication = applicant.jobsApplied.find(
      (app) => app.jobId.toString() === jobId
    );
    if (userApplication) {
      userApplication.status = status;
      await applicant.save();
    }

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};

// Delete job (Recruiter only - own jobs)
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own job posts",
      });
    }

    await Job.findByIdAndDelete(id);

    // Remove from user's jobsPosted array
    const user = await User.findById(userId);
    user.jobsPosted = user.jobsPosted.filter(
      (jobId) => jobId.toString() !== id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

// Get jobs posted by current recruiter
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const jobs = await Job.find({ postedBy: userId })
      .populate(
        "applicants.userId",
        "name email profilePicture skills experience"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments({ postedBy: userId });

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your jobs",
      error: error.message,
    });
  }
};

// Get jobs applied by current employee
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const user = await User.findById(userId).populate({
      path: "jobsApplied.jobId",
      populate: {
        path: "postedBy",
        select: "name email company",
      },
    });

    let applications = user.jobsApplied;

    // Filter by status if provided
    if (status) {
      applications = applications.filter((app) => app.status === status);
    }

    // Sort by applied date (newest first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedApplications = applications.slice(
      skip,
      skip + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: paginatedApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(applications.length / limit),
        totalApplications: applications.length,
        hasNext: page * limit < applications.length,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your applications",
      error: error.message,
    });
  }
};

// Get all applications for a specific job (Recruiter only)
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "appliedAt",
      sortOrder = "desc",
    } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if current user is the recruiter who posted this job
    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own job posts",
      });
    }

    // Build query for filtering applications
    let applications = job.applicants;

    // Filter by status if provided
    if (status) {
      applications = applications.filter((app) => app.status === status);
    }

    // Sort applications
    applications.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortOrder === "desc") {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    // Implement pagination
    const skip = (page - 1) * limit;
    const paginatedApplications = applications.slice(
      skip,
      skip + parseInt(limit)
    );

    // Populate user details for the paginated applications
    const populatedApplications = await Job.findById(jobId)
      .populate({
        path: "applicants.userId",
        select: "name email profilePicture skills experience resume",
      })
      .select("applicants")
      .then((job) => {
        return job.applicants
          .filter((app) => {
            // Apply the same filtering and sorting logic
            if (status && app.status !== status) return false;
            return paginatedApplications.some(
              (pApp) => pApp.userId.toString() === app.userId._id.toString()
            );
          })
          .sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (sortOrder === "desc") {
              return new Date(bValue) - new Date(aValue);
            } else {
              return new Date(aValue) - new Date(bValue);
            }
          });
      });

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        jobId: job._id,
        applications: populatedApplications,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(applications.length / limit),
        totalApplications: applications.length,
        hasNext: page * limit < applications.length,
        hasPrev: page > 1,
      },
      stats: {
        total: job.applicants.length,
        pending: job.applicants.filter((app) => app.status === "pending")
          .length,
        accepted: job.applicants.filter((app) => app.status === "accepted")
          .length,
        rejected: job.applicants.filter((app) => app.status === "rejected")
          .length,
        interview: job.applicants.filter((app) => app.status === "interview")
          .length,
        shortlisted: job.applicants.filter(
          (app) => app.status === "shortlisted"
        ).length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job applications",
      error: error.message,
    });
  }
};
