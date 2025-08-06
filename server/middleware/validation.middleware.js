export const validateJob = (req, res, next) => {
  const {
    title,
    description,
    company,
    location,
    jobType,
    workMode,
    salary,
    skills,
    category,
  } = req.body;

  const errors = [];

  // Required field validations
  if (!title || title.trim().length === 0) {
    errors.push("Job title is required");
  }

  if (!description || description.trim().length === 0) {
    errors.push("Job description is required");
  }

  if (!company || company.trim().length === 0) {
    errors.push("Company name is required");
  }

  if (!location || location.trim().length === 0) {
    errors.push("Location is required");
  }

  if (!jobType) {
    errors.push("Job type is required");
  } else if (
    !["full-time", "part-time", "contract", "internship", "freelance"].includes(
      jobType
    )
  ) {
    errors.push("Invalid job type");
  }

  if (!workMode) {
    errors.push("Work mode is required");
  } else if (!["remote", "onsite", "hybrid"].includes(workMode)) {
    errors.push("Invalid work mode");
  }

  if (!category) {
    errors.push("Category is required");
  } else if (
    ![
      "technology",
      "marketing",
      "sales",
      "design",
      "finance",
      "hr",
      "operations",
      "other",
    ].includes(category)
  ) {
    errors.push("Invalid category");
  }

  // Salary validation
  if (!salary) {
    errors.push("Salary information is required");
  } else {
    if (!salary.min || typeof salary.min !== "number" || salary.min < 0) {
      errors.push("Valid minimum salary is required");
    }
    if (!salary.max || typeof salary.max !== "number" || salary.max < 0) {
      errors.push("Valid maximum salary is required");
    }
    if (salary.min && salary.max && salary.min > salary.max) {
      errors.push("Minimum salary cannot be greater than maximum salary");
    }
  }

  // Skills validation
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    errors.push("At least one skill is required");
  }

  // Optional field validations
  if (req.body.experience) {
    const { min, max } = req.body.experience;
    if (min !== undefined && (typeof min !== "number" || min < 0)) {
      errors.push("Valid minimum experience is required");
    }
    if (max !== undefined && (typeof max !== "number" || max < 0)) {
      errors.push("Valid maximum experience is required");
    }
    if (min !== undefined && max !== undefined && min > max) {
      errors.push(
        "Minimum experience cannot be greater than maximum experience"
      );
    }
  }

  if (req.body.applicationDeadline) {
    const deadline = new Date(req.body.applicationDeadline);
    if (deadline <= new Date()) {
      errors.push("Application deadline must be in the future");
    }
  }

  if (
    req.body.maxApplicants &&
    (typeof req.body.maxApplicants !== "number" || req.body.maxApplicants < 1)
  ) {
    errors.push("Maximum applicants must be a positive number");
  }

  // Length validations
  if (title && title.length > 100) {
    errors.push("Job title cannot exceed 100 characters");
  }

  if (description && description.length > 5000) {
    errors.push("Job description cannot exceed 5000 characters");
  }

  if (company && company.length > 100) {
    errors.push("Company name cannot exceed 100 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

export const validateApplication = (req, res, next) => {
  const { coverLetter, resume } = req.body;
  const errors = [];

  // Cover letter validation (optional but if provided, validate)
  if (coverLetter && typeof coverLetter !== "string") {
    errors.push("Cover letter must be a string");
  }

  if (coverLetter && coverLetter.length > 2000) {
    errors.push("Cover letter cannot exceed 2000 characters");
  }

  // Resume validation (optional but if provided, validate)
  if (resume && typeof resume !== "string") {
    errors.push("Resume must be a valid URL string");
  }

  // Basic URL validation for resume
  if (resume) {
    try {
      new URL(resume);
    } catch (error) {
      errors.push("Resume must be a valid URL");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

export const validateApplicationStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "hired",
  ];

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status. Valid statuses are: " + validStatuses.join(", "),
    });
  }

  next();
};
