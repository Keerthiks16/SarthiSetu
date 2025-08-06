import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  Users,
  Eye,
  CheckCircle,
  Search,
  XCircle,
  Filter,
  RotateCcw,
  ChevronDown,
  Loader2,
} from "lucide-react";
import useJobStore from "../../store/jobStore";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import EmpNav from "./EmpNav";

const AllPosts = () => {
  const { jobs, loading, error, pagination, getAllJobs } = useJobStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    workMode: "",
    category: "",
    minSalary: "",
    maxSalary: "",
    minExperience: "",
    maxExperience: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Loading state for search operations
  const [isSearching, setIsSearching] = useState(false);

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm, filterObj) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(searchTerm, filterObj);
        }, 300); // Reduced debounce time for better responsiveness
      };
    })(),
    []
  );

  // Optimized search function
  const performSearch = useCallback(
    async (searchTerm, filterObj) => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams();

        // Only add non-empty parameters
        if (searchTerm?.trim()) queryParams.append("q", searchTerm.trim());
        if (filterObj.location?.trim())
          queryParams.append("location", filterObj.location.trim());
        if (filterObj.jobType) queryParams.append("jobType", filterObj.jobType);
        if (filterObj.workMode)
          queryParams.append("workMode", filterObj.workMode);
        if (filterObj.category)
          queryParams.append("category", filterObj.category);
        if (filterObj.minSalary)
          queryParams.append("minSalary", filterObj.minSalary);
        if (filterObj.maxSalary)
          queryParams.append("maxSalary", filterObj.maxSalary);
        if (filterObj.minExperience)
          queryParams.append("minExperience", filterObj.minExperience);
        if (filterObj.maxExperience)
          queryParams.append("maxExperience", filterObj.maxExperience);

        queryParams.append("sortBy", filterObj.sortBy);
        queryParams.append("sortOrder", filterObj.sortOrder);

        await getAllJobs(queryParams.toString());
      } finally {
        setIsSearching(false);
      }
    },
    [getAllJobs]
  );

  // Initial load
  useEffect(() => {
    performSearch("", filters);
  }, []); // Only run on mount

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSearch(value, filters);
    },
    [filters, debouncedSearch]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);

      // Immediate search for dropdowns, debounced for text inputs
      if (name === "location" || name === "minSalary" || name === "maxSalary") {
        debouncedSearch(searchQuery, newFilters);
      } else {
        performSearch(searchQuery, newFilters);
      }
    },
    [filters, searchQuery, debouncedSearch, performSearch]
  );

  // Reset filters
  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      location: "",
      jobType: "",
      workMode: "",
      category: "",
      minSalary: "",
      maxSalary: "",
      minExperience: "",
      maxExperience: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    setSearchQuery("");
    setFilters(resetFilters);
    performSearch("", resetFilters);
  }, [performSearch]);

  // Check if user has already applied to a job
  const hasUserApplied = useCallback(
    (jobId) => {
      if (!user || !user.jobsApplied) return false;
      return user.jobsApplied.some(
        (application) => application.jobId === jobId
      );
    },
    [user]
  );

  // Memoized utility functions
  const formatSalary = useMemo(
    () => (salary) => {
      if (salary.min && salary.max) {
        const currency = salary.currency === "INR" ? "₹" : "$";
        return `${currency}${salary.min.toLocaleString()} - ${currency}${salary.max.toLocaleString()}`;
      }
      return "Salary not specified";
    },
    []
  );

  const formatDate = useMemo(
    () => (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    []
  );

  const formatExperience = useMemo(
    () => (experience) => {
      if (experience.min === experience.max) {
        return `${experience.min} years`;
      }
      return `${experience.min}-${experience.max} years`;
    },
    []
  );

  // Constants for dropdowns
  const jobTypes = useMemo(
    () => ["Full-time", "Part-time", "Contract", "Internship"],
    []
  );
  const workModes = useMemo(() => ["Remote", "On-site", "Hybrid"], []);
  const categories = useMemo(
    () => [
      "Software Development",
      "Marketing",
      "Design",
      "Sales",
      "Finance",
      "HR",
      "Customer Service",
    ],
    []
  );
  const experienceOptions = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i + 1),
    []
  );

  if (loading && !isSearching) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <EmpNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading job postings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <EmpNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-md">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 text-lg font-medium mb-4">{error}</p>
            <button
              onClick={() => performSearch("", filters)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <EmpNav />

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-4">
            <Briefcase className="h-9 w-9 text-indigo-600" />
            All Job Postings
            {isSearching && (
              <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
            )}
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            {pagination?.totalJobs || 0} job
            {pagination?.totalJobs !== 1 ? "s" : ""} available for you to
            explore.
          </p>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Filter className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Filter & Search Jobs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative col-span-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin h-4 w-4 text-indigo-500" />
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., New York, Remote"
                className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <label
                htmlFor="jobType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Job Type
              </label>
              <div className="relative">
                <select
                  id="jobType"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Work Mode Filter */}
            <div>
              <label
                htmlFor="workMode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Work Mode
              </label>
              <div className="relative">
                <select
                  id="workMode"
                  name="workMode"
                  value={filters.workMode}
                  onChange={handleFilterChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Modes</option>
                  {workModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Min Salary Filter */}
            <div>
              <label
                htmlFor="minSalary"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Min Salary
              </label>
              <input
                type="number"
                id="minSalary"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="e.g., 50000"
                className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Max Experience Filter */}
            <div>
              <label
                htmlFor="maxExperience"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Experience (Years)
              </label>
              <div className="relative">
                <select
                  id="maxExperience"
                  name="maxExperience"
                  value={filters.maxExperience}
                  onChange={handleFilterChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  {experienceOptions.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleResetFilters}
              disabled={isSearching}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobs.length === 0 && !isSearching ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-dashed border-gray-300">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                No jobs found
              </h3>
              <p className="text-gray-500 text-lg">
                Adjust your filters or search terms to find more opportunities.
              </p>
            </div>
          ) : (
            jobs.map((job) => {
              const isApplied = hasUserApplied(job._id);

              return (
                <div
                  key={job._id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
                    isApplied ? "border-l-4 border-green-500" : ""
                  }`}
                >
                  <div className="p-7">
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {job.title}
                          </h3>
                          {job.isUrgent && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                          {isApplied && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-semibold text-indigo-600 mb-3">
                          {job.company}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {formatSalary(job.salary)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {job.jobType} • {job.workMode}
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            {formatExperience(job.experience)} experience
                          </div>
                        </div>
                      </div>

                      {/* Status and Category */}
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            job.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status.charAt(0).toUpperCase() +
                            job.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {job.category}
                        </span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-700 mb-5 line-clamp-3">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Footer */}
                    <div className="flex flex-wrap justify-between items-center pt-5 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </div>
                        {job.applicationDeadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              Deadline: {formatDate(job.applicationDeadline)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Max {job.maxApplicants} applicants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>{job.views} views</span>
                        </div>
                      </div>

                      {/* Posted By */}
                      <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                        <span>Posted by </span>
                        <span className="font-semibold text-gray-900">
                          {job.postedBy.name}
                        </span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      {isApplied ? (
                        <button
                          className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2 text-lg"
                          disabled
                        >
                          <CheckCircle className="h-5 w-5" />
                          Already Applied
                        </button>
                      ) : (
                        <button
                          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg text-lg"
                          onClick={() => navigate(`/job/${job._id}`)}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Info */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-10 text-center text-gray-600 text-base">
            <p>
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
