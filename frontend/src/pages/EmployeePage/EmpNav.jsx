import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { ClipboardList, Briefcase, Book, Brain, LogOut } from "lucide-react";

const EmpNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navigationItems = [
    {
      id: "applications",
      label: "Application Status",
      icon: ClipboardList,
      path: "/applications",
    },
    { id: "jobs", label: "Browse Jobs", icon: Briefcase, path: "/all" },
    { id: "courses", label: "Courses", icon: Book, path: "/courses" },
    { id: "aptitude", label: "Aptitude", icon: Brain, path: "/aptitude" },
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
            <h1 className="text-2xl font-bold text-indigo-400">NFC</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* User & Logout Section */}
          <div className="flex items-center">
            <span className="text-gray-300 font-medium mr-4">
              Hello, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EmpNav;
