import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Briefcase, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";

const RecNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/recruiter-home",
    },
    {
      id: "my-jobs",
      label: "My Jobs",
      icon: Briefcase,
      path: "/mypostings",
    },
    {
      id: "post-job",
      label: "Post a Job",
      icon: PlusCircle,
      path: "/postjob",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation("/recruiter-home")}
              className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              SarthiSetu
            </button>
          </div>

          {/* Navigation Links - Mobile Hidden */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1 bg-gray-700 p-1 rounded-lg">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* User & Logout Section */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-gray-300 font-medium">Hi, {user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center shadow-md hover:shadow-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}

            {/* Mobile User Section */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-300 font-medium">
                  Hi, {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RecNav;
