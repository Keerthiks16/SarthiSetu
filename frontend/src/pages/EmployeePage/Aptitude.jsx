import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Users, Lightbulb, Compass, LifeBuoy } from "lucide-react";
import EmpNav from "./EmpNav"; // Import the navigation component

const Aptitude = () => {
  const navigate = useNavigate();

  const aptitudeOptions = [
    {
      id: "quiz",
      title: "Take a Quiz",
      description: "Test your knowledge and skills with various quizzes.",
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      path: "/quiz", // Assuming a /quiz route for the actual quiz page
    },
    {
      id: "mentor-connect",
      title: "Mentor Connect",
      description: "Connect with experienced mentors for guidance and support.",
      icon: <Users className="h-12 w-12 text-green-600" />,
      path: "/mentorconnect", // Assuming a /mentor-connect route
    },
    {
      id: "interest-profiler",
      title: "Interest Profiler",
      description:
        "Discover your career interests and find suitable job paths.",
      icon: <Lightbulb className="h-12 w-12 text-purple-600" />,
      path: "/interestprofiler", // Assuming an /interest-profiler route
    },
    {
      id: "path-builder",
      title: "Path Builder Agent",
      description:
        "Get personalized career path recommendations based on your skills.",
      icon: <Compass className="h-12 w-12 text-orange-600" />,
      path: "/pathbuilder", // New route for path builder
    },
    {
      id: "support-helper",
      title: "Sahayoga Support",
      description:
        "Get help with childcare, transport, and digital access challenges.",
      icon: <LifeBuoy className="h-12 w-12 text-teal-600" />,
      path: "/local-guider", // New route for support helper
    },
  ];

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmpNav /> {/* Render the navigation bar */}
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          Aptitude & Career Development
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aptitudeOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">{option.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {option.title}
              </h2>
              <p className="text-gray-600 mb-4 flex-grow">
                {option.description}
              </p>
              <button
                onClick={() => handleOptionClick(option.path)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Aptitude;
