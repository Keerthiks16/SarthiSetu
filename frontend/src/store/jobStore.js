import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE + "/api/job";

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // This is crucial for sending cookies
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
};

const useJobStore = create((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  myJobs: [],
  myApplications: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNext: false,
    hasPrev: false,
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Get all jobs with filters
  getAllJobs: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = params.toString()
        ? `${API_BASE_URL}?${params}`
        : API_BASE_URL;
      const data = await makeRequest(url);

      if (data.success) {
        set({
          jobs: data.data,
          pagination: data.pagination,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch jobs",
        loading: false,
      });
    }
  },

  // Get single job by ID
  getJobById: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(`${API_BASE_URL}/${id}`);

      if (data.success) {
        set({
          currentJob: data.data,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch job",
        loading: false,
      });
    }
  },

  // Create new job (recruiter only)
  createJob: async (jobData) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(jobData),
      });

      console.log("Create job response:", data);
      if (data.success) {
        set((state) => ({
          jobs: [data.data, ...state.jobs],
          myJobs: [data.data, ...state.myJobs],
          loading: false,
        }));
        return data.data;
      }
    } catch (error) {
      console.error("Create job error:", error);
      set({
        error: error.message || "Failed to create job",
        loading: false,
      });
      throw error;
    }
  },

  // Update job (recruiter only)
  updateJob: async (id, jobData) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(jobData),
      });

      if (data.success) {
        const updatedJob = data.data;
        set((state) => ({
          jobs: state.jobs.map((job) => (job._id === id ? updatedJob : job)),
          myJobs: state.myJobs.map((job) =>
            job._id === id ? updatedJob : job
          ),
          currentJob:
            state.currentJob?._id === id ? updatedJob : state.currentJob,
          loading: false,
        }));
        return updatedJob;
      }
    } catch (error) {
      set({
        error: error.message || "Failed to update job",
        loading: false,
      });
      throw error;
    }
  },

  // Delete job (recruiter only)
  deleteJob: async (id) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (data.success) {
        set((state) => ({
          jobs: state.jobs.filter((job) => job._id !== id),
          myJobs: state.myJobs.filter((job) => job._id !== id),
          currentJob: state.currentJob?._id === id ? null : state.currentJob,
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Failed to delete job",
        loading: false,
      });
      throw error;
    }
  },

  // Apply for job (employee only)
  applyForJob: async (id, applicationData) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(`${API_BASE_URL}/${id}/apply`, {
        method: "POST",
        body: JSON.stringify(applicationData),
      });

      if (data.success) {
        // Update current job to reflect application
        set((state) => ({
          currentJob:
            state.currentJob?._id === id
              ? {
                  ...state.currentJob,
                  hasApplied: true,
                  applicationStatus: "pending",
                }
              : state.currentJob,
          loading: false,
        }));

        // Refresh applications
        get().getMyApplications();
      }
    } catch (error) {
      set({
        error: error.message || "Failed to apply for job",
        loading: false,
      });
      throw error;
    }
  },

  // Get jobs posted by current recruiter
  getMyJobs: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(
        `${API_BASE_URL}/recruiter/my-jobs?page=${page}&limit=${limit}`
      );

      if (data.success) {
        set({
          myJobs: data.data,
          pagination: data.pagination,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch your jobs",
        loading: false,
      });
    }
  },

  // Get applications by current employee
  getMyApplications: async (page = 1, limit = 10, status = "") => {
    try {
      set({ loading: true, error: null });
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const data = await makeRequest(
        `${API_BASE_URL}/employee/my-applications?${params}`
      );

      if (data.success) {
        set({
          myApplications: data.data,
          pagination: data.pagination,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch your applications",
        loading: false,
      });
    }
  },

  // Update application status (recruiter only)
  updateApplicationStatus: async (jobId, applicantId, status) => {
    try {
      set({ loading: true, error: null });
      const data = await makeRequest(
        `${API_BASE_URL}/${jobId}/applications/${applicantId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      if (data.success) {
        // Update the job in myJobs if it exists
        set((state) => ({
          myJobs: state.myJobs.map((job) => {
            if (job._id === jobId) {
              return {
                ...job,
                applicants: job.applicants.map((app) =>
                  app.userId._id === applicantId ? { ...app, status } : app
                ),
              };
            }
            return job;
          }),
          loading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Failed to update application status",
        loading: false,
      });
      throw error;
    }
  },

  // Clear current job
  clearCurrentJob: () => set({ currentJob: null }),

  // Reset store
  reset: () =>
    set({
      jobs: [],
      currentJob: null,
      myJobs: [],
      myApplications: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNext: false,
        hasPrev: false,
      },
    }),
}));

export default useJobStore;
