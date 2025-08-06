import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import EmpNav from "./EmpNav"; // Import the new navigation component
import {
  LayoutDashboard, // For Total Applications
  Hourglass, // For Pending
  Star, // For Shortlisted
  CheckCircle, // For Accepted
  BriefcaseBusiness, // For Recent Applications heading
  Search, // For Browse Jobs button in empty state
  Loader2, // For loading indicator
} from "lucide-react";

const EmpHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // To show loading only on first fetch

  useEffect(() => {
    if (user && user.jobsApplied.length > 0) {
      fetchJobDetails();
    } else {
      setInitialLoad(false); // If no jobs applied, no need to show loading
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
      setInitialLoad(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
        <p className="ml-2 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  const handleJobsNavigation = () => {
    navigate("/all");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "shortlisted":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Navbar component */}
      <EmpNav />

      {/* Main Content - Home Page */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-indigo-200 text-lg">
              Here's a quick overview of your job application journey.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Applications Card */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {statusCounts.total}
                </p>
              </div>
            </div>

            {/* Pending Card */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Hourglass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statusCounts.pending}
                </p>
              </div>
            </div>

            {/* Shortlisted Card */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statusCounts.shortlisted}
                </p>
              </div>
            </div>

            {/* Accepted Card */}
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statusCounts.accepted}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <BriefcaseBusiness className="h-6 w-6 mr-3 text-indigo-500" />
                Recent Applications
              </h2>
              <button
                onClick={() => navigate("/applications")}
                className="text-indigo-600 hover:text-indigo-800 text-base font-medium flex items-center group"
              >
                View All
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {loading && initialLoad ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-4" />
                <p className="text-gray-500">Fetching your applications...</p>
              </div>
            ) : user.jobsApplied.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg mb-6">
                  You haven't applied to any jobs yet. Start your journey!
                </p>
                <button
                  onClick={handleJobsNavigation}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.jobsApplied.slice(0, 3).map((app) => {
                  const job = jobDetails[app.jobId];
                  return (
                    <div
                      key={app._id}
                      className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {job?.title || `Job ID: ${app.jobId}`}
                        </h3>
                        {job && (
                          <p className="text-gray-600 text-sm mt-1">
                            {job.company} • {job.location}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </span>
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

export default EmpHome;
