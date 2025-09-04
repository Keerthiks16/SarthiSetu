import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import RecNav from "./RecNav"; // Recruiter Navbar
import { Briefcase, Users, ArrowRight } from "lucide-react";
import axios from "axios";

const RecHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyJobs = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get(
          "https://nfc4-the-codefather-1.onrender.com/api/job/recruiter/my-jobs",
          { withCredentials: true }
        );
        if (response.data.success) {
          setMyJobs(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching my jobs:", err);
        setError("Failed to fetch jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, [user]);

  if (!user || user.role !== "recruiter") {
    return <div className="p-4 text-center">Unauthorized access.</div>;
  }

  if (loading) {
    return (
      <>
        <RecNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your jobs...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <RecNav />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto p-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  const handleViewApplicants = (jobId) => {
    navigate(`/my-jobs/${jobId}/applicants`);
  };

  const handlePostJob = () => {
    navigate("/post");
  };

  return (
    <>
      <RecNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-blue-100">
              Here's a quick overview of your job postings.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                My Job Postings
              </h2>
            </div>

            {myJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't posted any jobs yet.
                </p>
                <button
                  onClick={handlePostJob}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Start by Posting a Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div
                    key={job._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Posted on:{" "}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">
                            {job.applicants.length} Applicant
                            {job.applicants.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewApplicants(job._id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          View Applicants <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecHome;
