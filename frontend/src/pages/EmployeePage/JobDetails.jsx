import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(
          `https://nfc4-the-codefather-1.onrender.com/api/job/${id}`
        );
        setJob(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch job details");
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    console.log(job);

    if (!job) return;
    setApplying(true);
    try {
      // Assuming you have authentication and can get the user ID
      const response = await axios.post(
        `https://nfc4-the-codefather-1.onrender.com/api/job/${id}/apply`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            // Include authorization token if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true, // <== This is required for cookie-based auth
        }
      );

      toast.success("Application submitted successfully!");
      // Update the job data to reflect the application
      setJob((prev) => ({
        ...prev,
        hasApplied: true,
        applicationStatus: "pending",
        applicants: [
          ...prev.applicants,
          {
            /* applicant details */
          },
        ],
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply for the job");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading job details...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!job) return <div className="text-center py-8">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-blue-50 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
              <h2 className="text-xl text-blue-600 mt-1">{job.company}</h2>
              <p className="text-gray-600 mt-2">{job.location}</p>
            </div>
            {job.isUrgent && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                Urgent Hiring
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {job.jobType}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {job.workMode}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              {job.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Salary Range</h3>
              <p>
                {job.salary.currency} {job.salary.min.toLocaleString()} -{" "}
                {job.salary.max.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Experience Required
              </h3>
              <p>
                {job.experience.min} - {job.experience.max} years
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Application Deadline
              </h3>
              <p>{new Date(job.applicationDeadline).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Posted By</h3>
              <p>{job.postedBy.name}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Benefits</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            {job.hasApplied ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                <p>You've already applied for this job!</p>
                {job.applicationStatus && (
                  <p className="mt-2">
                    Status:{" "}
                    <span className="capitalize">{job.applicationStatus}</span>
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  applying ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
