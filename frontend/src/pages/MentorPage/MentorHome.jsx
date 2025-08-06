import React from "react";
import useAuthStore from "../../store/authStore";

const MentorHome = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return <div className="p-4">Loading user data...</div>;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">NFC</div>

        <div className="flex space-x-6 items-center">
          {/* Placeholder tabs */}
          <button className="text-gray-600 hover:text-gray-900 font-medium">
            Dashboard
          </button>
          <button className="text-gray-600 hover:text-gray-900 font-medium">
            Sessions
          </button>
          <button className="text-gray-600 hover:text-gray-900 font-medium">
            Profile
          </button>
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
      <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Welcome, {user.name} 👋
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Your Profile</h2>
          <p className="text-gray-600 mt-2">Email: {user.email}</p>
          <p className="text-gray-600">
            Mentoring:{" "}
            {user.availableForMentoring ? "Available" : "Not Available"}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Mentorship Sessions
          </h2>
          {user.mentorshipSessions.length === 0 ? (
            <p className="text-gray-500 mt-2">
              No mentorship sessions scheduled yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {user.mentorshipSessions.map((session, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-100 rounded-md shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      Session #{index + 1}
                    </p>
                    {/* Add more session details when available */}
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-md font-semibold">
                    Upcoming
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorHome;
