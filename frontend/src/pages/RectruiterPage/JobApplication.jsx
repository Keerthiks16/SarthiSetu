import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecNav from "./RecNav";
import axios from "axios";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Bookmark,
  Hourglass,
  RefreshCcw,
  ArrowLeft,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const { user } = useAuthStore();

  // Corrected status options to match your Mongoose schema
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "rejected", label: "Rejected" },
    { value: "hired", label: "Hired" },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    shortlisted: "bg-purple-100 text-purple-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-green-100 text-green-800",
  };

  const statusIcons = {
    pending: <Clock size={16} />,
    reviewed: <RefreshCcw size={16} />,
    shortlisted: <Bookmark size={16} />,
    rejected: <XCircle size={16} />,
    hired: <CheckCircle size={16} />,
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nfc4-the-codefather-1.onrender.com/api/job/${jobId}/applications`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setJobTitle(response.data.data.jobTitle);
        setApplications(response.data.data.applications);
        setStats(response.data.stats);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error fetching job applications:", err);
      setError("Failed to fetch job applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (applicantId, newStatus) => {
    setUpdatingStatusId(applicantId);
    try {
      await axios.patch(
        `https://nfc4-the-codefather-1.onrender.com/api/job/${jobId}/applications/${applicantId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Re-fetch applications to get the updated data
      await fetchApplications();
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Fetching applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RecNav />
        <div className="max-w-6xl mx-auto p-6 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RecNav />

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Applications for {jobTitle}
          </h1>
          <button
            onClick={() => navigate("/my-jobs")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Jobs
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm font-medium text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-sm font-medium text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.shortlisted}
            </p>
            <p className="text-sm font-medium text-gray-600">Shortlisted</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.interview}
            </p>
            <p className="text-sm font-medium text-gray-600">Interview</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </p>
            <p className="text-sm font-medium text-gray-600">Accepted</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm font-medium text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {app.userId.name}
                    </h3>
                    <p className="text-gray-600">{app.userId.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app._id, e.target.value)
                        }
                        className={`block w-40 px-4 py-2 rounded-md text-sm font-medium appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          statusColors[app.status]
                        }`}
                        disabled={updatingStatusId === app.userId._id}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatusId === app.userId._id && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.userId &&
                    app.userId.skills &&
                    app.userId.skills.length > 0 ? (
                      app.userId.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No skills listed</p>
                    )}
                  </div>
                  {/* Here you could add more details like cover letter, resume, experience */}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Hourglass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-500">
                Check back later, or share your job posting to get more
                applicants.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
