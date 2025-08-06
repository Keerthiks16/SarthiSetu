import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const ApplicationsApplied = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.jobsApplied.length > 0) {
      fetchJobDetails();
    }
  }, [user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    const details = {};

    try {
      // Fetch details for all applied jobs
      const promises = user.jobsApplied.map(async (app) => {
        try {
          const response = await fetch(
            `http://localhost:5001/api/job/${app.jobId}`
          );
          if (response.ok) {
            const data = await response.json();
            return { jobId: app.jobId, data: data.data };
          }
          return { jobId: app.jobId, data: null };
        } catch (error) {
          console.error(`Error fetching job ${app.jobId}:`, error);
          return { jobId: app.jobId, data: null };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ jobId, data }) => {
        details[jobId] = data;
      });

      setJobDetails(details);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Loading user data...</div>;
  }

  const handleLogout = () => {
    logout();
  };

  const handleJobsNavigation = () => {
    navigate("/all");
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    const { min, max, currency = "INR" } = salary;
    return `${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`;
  };

  const formatExperience = (experience) => {
    if (!experience) return "Not specified";
    const { min, max } = experience;
    return `${min} - ${max} years`;
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      shortlisted: 0,
      rejected: 0,
      total: user.jobsApplied.length,
    };

    user.jobsApplied.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const navigationItems = [
    {
      id: "applications",
      label: "Application Status",
      icon: "📋",
      path: "/applications",
    },
    { id: "jobs", label: "Browse Jobs", icon: "💼", path: "/all" },
    { id: "courses", label: "Courses", icon: "📚", path: "/courses" },
    { id: "quiz", label: "Quiz", icon: "🧠", path: "/quiz" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div
          className="text-xl font-bold text-gray-800 cursor-pointer"
          onClick={() => navigate("/")}
        >
          NFC
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                item.path === "/applications"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">Application Status 📋</h1>
            <p className="text-blue-100">
              Track your application progress and status
            </p>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Application Status Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusCounts)
                .filter(([key]) => key !== "total")
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="text-center p-4 border rounded-lg"
                  >
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Detailed Applications */}
          <div className="bg-white shadow-md rounded-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              All Applications ({user.jobsApplied.length})
            </h2>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading job details...</p>
              </div>
            )}

            {user.jobsApplied.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't applied to any jobs yet.
                </p>
                <button
                  onClick={handleJobsNavigation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {user.jobsApplied.map((app) => {
                  const job = jobDetails[app.jobId];

                  return (
                    <div
                      key={app._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Application Status Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {job?.title || `Job ID: ${app.jobId}`}
                          </h3>
                          {job && (
                            <p className="text-gray-600">
                              {job.company} • {job.location}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-3 py-1 text-sm rounded-md font-semibold ${
                              app.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : app.status === "reviewed"
                                ? "bg-blue-100 text-blue-800"
                                : app.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : app.status === "shortlisted"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </span>
                          <p className="text-gray-500 text-sm">
                            Applied:{" "}
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Job Details */}
                      {job ? (
                        <div className="space-y-4">
                          {/* Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Job Type
                              </p>
                              <p className="text-gray-600 capitalize">
                                {job.jobType} • {job.workMode}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Salary
                              </p>
                              <p className="text-gray-600">
                                {formatSalary(job.salary)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Experience Required
                              </p>
                              <p className="text-gray-600">
                                {formatExperience(job.experience)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Application Deadline
                              </p>
                              <p className="text-gray-600">
                                {new Date(
                                  job.applicationDeadline
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Description
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {job.description}
                            </p>
                          </div>

                          {/* Skills */}
                          {job.skills && job.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Required Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Benefits */}
                          {job.benefits && job.benefits.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Benefits
                              </p>
                              <ul className="text-gray-600 text-sm space-y-1">
                                {job.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Tags */}
                          {job.tags && job.tags.length > 0 && (
                            <div>
                              <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {job.isUrgent && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                                    🚨 Urgent
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Posted By */}
                          {job.postedBy && (
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                Posted by {job.postedBy.name} • {job.views}{" "}
                                views
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          {loading
                            ? "Loading job details..."
                            : "Job details not available"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsApplied;
