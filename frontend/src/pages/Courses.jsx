import React, { useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Search,
  Clock,
  Briefcase,
  Code,
  ListVideo,
  Loader2, // Added Loader2 for loading indicator
  XCircle, // Added XCircle for error state
} from "lucide-react";
import EmpNav from "./../pages/EmployeePage/EmpNav"; // Import the new navigation component

export default function Course() {
  const [searchTerm, setSearchTerm] = useState("");
  const [crashCourses, setCrashCourses] = useState([]);
  const [detailedPlaylists, setDetailedPlaylists] = useState([]);
  const [jobReadyVideos, setJobReadyVideos] = useState([]);
  const [projectVideos, setProjectVideos] = useState([]);
  const [generalVideos, setGeneralVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State for handling errors

  // IMPORTANT: Replace with your actual YouTube API Key.
  // In a real application, you would load this securely (e.g., from environment variables).
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const fetchResults = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setLoading(true);
    setError(null); // Clear previous errors

    const queries = {
      crash: `${searchTerm} crash course`,
      detailed: `${searchTerm} detailed course`,
      job: `${searchTerm} get job ready`,
      projects: `projects in ${searchTerm}`,
      general: `${searchTerm}`,
    };

    try {
      const [crashRes, detailedRes, jobRes, projectRes, generalRes] =
        await Promise.all([
          axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              part: "snippet",
              q: queries.crash,
              type: "video",
              maxResults: 6,
              order: "viewCount",
              key: apiKey,
            },
          }),
          axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              part: "snippet",
              q: queries.detailed,
              type: "playlist",
              maxResults: 6,
              order: "viewCount",
              key: apiKey,
            },
          }),
          axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              part: "snippet",
              q: queries.job,
              type: "video",
              maxResults: 6,
              order: "viewCount",
              key: apiKey,
            },
          }),
          axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              part: "snippet",
              q: queries.projects,
              type: "video",
              maxResults: 6,
              order: "viewCount",
              key: apiKey,
            },
          }),
          axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
              part: "snippet",
              q: queries.general,
              type: "video",
              maxResults: 6,
              order: "viewCount",
              key: apiKey,
            },
          }),
        ]);

      setCrashCourses(crashRes.data.items || []);
      setDetailedPlaylists(detailedRes.data.items || []);
      setJobReadyVideos(jobRes.data.items || []);
      setProjectVideos(projectRes.data.items || []);
      setGeneralVideos(generalRes.data.items || []);

      // If no results across all categories, set a message
      if (
        crashRes.data.items.length === 0 &&
        detailedRes.data.items.length === 0 &&
        jobRes.data.items.length === 0 &&
        projectRes.data.items.length === 0 &&
        generalRes.data.items.length === 0
      ) {
        setError("No courses found for your search. Try a different topic!");
      }
    } catch (err) {
      console.error("Failed fetching YouTube data", err);
      setError("Failed to fetch courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderVideoSection = (title, videos, IconComponent) => {
    if (!videos || videos.length === 0) return null;

    return (
      <div className="mb-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-gray-800">
          <IconComponent className="h-6 w-6 text-indigo-500" /> {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id.videoId || video.id.playlistId}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              {video.id.videoId ? (
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${video.id.videoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.snippet.title}
                  className="rounded-t-xl"
                ></iframe>
              ) : (
                <a
                  href={`https://www.youtube.com/playlist?list=${video.id.playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/640x360/E0E0E0/616161?text=No+Image";
                    }}
                  />
                </a>
              )}
              <div className="p-4">
                <p className="font-semibold text-lg line-clamp-2 text-gray-900">
                  {video.snippet.title}
                </p>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-gray-400" />{" "}
                  {video.snippet.channelTitle}
                </p>
                <a
                  href={
                    video.id.videoId
                      ? `https://www.youtube.com/watch?v=${video.id.videoId}`
                      : `https://www.youtube.com/playlist?list=${video.id.playlistId}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Watch Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const allSectionsEmpty =
    crashCourses.length === 0 &&
    detailedPlaylists.length === 0 &&
    jobReadyVideos.length === 0 &&
    projectVideos.length === 0 &&
    generalVideos.length === 0;

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Navbar component */}
      <EmpNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-4 text-gray-900">
          <BookOpen className="h-9 w-9 text-indigo-600" />
          Smart Course Explorer
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter a topic: e.g., Web Dev, Python, ML..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchResults()}
              className="border border-gray-300 pl-12 pr-4 py-3 w-full rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-sm"
            />
          </div>
          <button
            onClick={fetchResults}
            disabled={loading || !searchTerm.trim()}
            className={`px-8 py-3 rounded-full flex items-center justify-center gap-2 text-lg font-semibold transition-colors duration-200 ${
              loading || !searchTerm.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Searching...
              </>
            ) : (
              <>
                <Search size={20} /> Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-md mb-8">
            <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && allSectionsEmpty && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-dashed border-gray-300">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              Discover New Skills
            </h3>
            <p className="text-gray-500 text-lg">
              Enter a topic in the search bar above to find relevant crash
              courses, detailed playlists, job-ready tutorials, and
              project-based learning videos.
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-10">
            {renderVideoSection("Crash Courses", crashCourses, Clock)}
            {renderVideoSection(
              "Detailed Playlists",
              detailedPlaylists,
              ListVideo
            )}
            {renderVideoSection(
              "Job Ready Tutorials",
              jobReadyVideos,
              Briefcase
            )}
            {renderVideoSection("Project-Based Learning", projectVideos, Code)}
            {renderVideoSection("General Tutorials", generalVideos, BookOpen)}
          </div>
        )}
      </div>
    </div>
  );
}
