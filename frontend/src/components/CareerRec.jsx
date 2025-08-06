import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Target,
  Award,
  Users,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const CareerRec = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    name: "",
    age: "",
    gender: "not_specified",
    location: "",
    education: "graduate",
    primary_interest: "technical",
    aptitude_areas: "",
    career_goal: "",
    preferred_work_type: "any",
    barriers: [],
    experience_years: 0,
  });

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [systemOptions, setSystemOptions] = useState({
    skill_categories: [],
    education_levels: [],
    work_types: [],
    barriers: [],
  });

  // API Base URL
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // Initialize the system
      await fetch(`${API_BASE_URL}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Get system options
      const response = await fetch(`${API_BASE_URL}/skill-categories`);
      const data = await response.json();
      setSystemOptions(data);
    } catch (error) {
      console.error("Failed to initialize system:", error);
      setError("Failed to initialize system. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBarriersChange = (barrier) => {
    setUserProfile((prev) => ({
      ...prev,
      barriers: prev.barriers.includes(barrier)
        ? prev.barriers.filter((b) => b !== barrier)
        : [...prev.barriers, barrier],
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return userProfile.name && userProfile.age && userProfile.location;
      case 2:
        return userProfile.education && userProfile.primary_interest;
      case 3:
        return true; // Optional step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setError("");
    } else {
      setError("Please fill in all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userProfile,
          age: parseInt(userProfile.age),
          experience_years: parseInt(userProfile.experience_years) || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setCurrentStep(4);
      } else {
        setError(data.message || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setUserProfile({
      name: "",
      age: "",
      gender: "not_specified",
      location: "",
      education: "graduate",
      primary_interest: "technical",
      aptitude_areas: "",
      career_goal: "",
      preferred_work_type: "any",
      barriers: [],
      experience_years: 0,
    });
    setRecommendations(null);
    setError("");
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
        <p className="text-gray-600 mt-2">
          Tell us about yourself to get personalized recommendations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={userProfile.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age *
          </label>
          <input
            type="number"
            min="16"
            max="65"
            value={userProfile.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={userProfile.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="not_specified">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={userProfile.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, State"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="mx-auto w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Education & Skills</h2>
        <p className="text-gray-600 mt-2">
          Help us understand your background and interests
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level *
          </label>
          <select
            value={userProfile.education}
            onChange={(e) => handleInputChange("education", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {systemOptions.education_levels.map((level) => (
              <option key={level} value={level}>
                {level
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Interest *
          </label>
          <select
            value={userProfile.primary_interest}
            onChange={(e) =>
              handleInputChange("primary_interest", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {systemOptions.skill_categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Skills/Aptitudes
          </label>
          <textarea
            value={userProfile.aptitude_areas}
            onChange={(e) =>
              handleInputChange("aptitude_areas", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="e.g., Python programming, graphic design, customer service..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={userProfile.experience_years}
            onChange={(e) =>
              handleInputChange("experience_years", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="mx-auto w-16 h-16 text-purple-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Goals & Preferences
        </h2>
        <p className="text-gray-600 mt-2">
          Tell us about your career goals and any constraints
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Goal
          </label>
          <input
            type="text"
            value={userProfile.career_goal}
            onChange={(e) => handleInputChange("career_goal", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., stable job, entrepreneurship, skill development"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Work Type
          </label>
          <select
            value={userProfile.preferred_work_type}
            onChange={(e) =>
              handleInputChange("preferred_work_type", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {systemOptions.work_types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Barriers/Constraints (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {systemOptions.barriers
              .filter((barrier) => barrier !== "none")
              .map((barrier) => (
                <label
                  key={barrier}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={userProfile.barriers.includes(barrier)}
                    onChange={() => handleBarriersChange(barrier)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {barrier.charAt(0).toUpperCase() + barrier.slice(1)}
                  </span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Award className="mx-auto w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">
          Your Career Recommendations
        </h2>
        <p className="text-gray-600 mt-2">
          Personalized recommendations based on your profile
        </p>
      </div>

      {/* Primary Job Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-blue-500" />
          Top Job Recommendations
        </h3>
        <div className="grid gap-4">
          {recommendations?.primary_recommendations?.map((job, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-800">
                  {job.job_title}
                </h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {job.match_score}% match
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {job.location}
                </p>
                <p>
                  <Target className="w-4 h-4 inline mr-1" />
                  Skills: {job.skills_required}
                </p>
                <p>
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Type: {job.work_type} • Level: {job.experience_level}
                </p>
                <p className="text-blue-600 italic">
                  Why recommended: {job.reasoning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
          Recommended Learning Path
        </h3>
        <div className="space-y-4">
          {recommendations?.learning_path?.map((stage, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                {stage.stage}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-800">{stage.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stage.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {stage.duration}
                  </span>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {stage.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentorship Suggestions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-500" />
          Mentorship Opportunities
        </h3>
        <div className="grid gap-4">
          {recommendations?.mentorship_suggestions?.map((mentor, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800">{mentor.type}</h4>
              <p className="text-sm text-gray-600 mt-1">{mentor.description}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span>{mentor.location}</span>
                <span className="mx-2">•</span>
                <span>{mentor.availability}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barrier Solutions */}
      {recommendations?.barrier_solutions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-purple-500" />
            Solutions for Your Barriers
          </h3>
          <div className="space-y-4">
            {recommendations.barrier_solutions.map((solution, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {solution.barrier}
                </h4>
                <ul className="space-y-1">
                  {solution.solutions.map((sol, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {sol}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6">
        <h3 className="text-xl font-bold mb-4">🚀 Next Steps</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>1. 📋 Complete skills assessment for detailed recommendations</p>
            <p>2. 📚 Start with the foundation course in your learning path</p>
            <p>3. 👥 Connect with a mentor in your field</p>
          </div>
          <div>
            <p>4. 💼 Apply to the top 2-3 recommended positions</p>
            <p>5. 🔄 Update your profile as you gain new skills</p>
            <p className="mt-2 font-medium">
              ✨ Your journey starts with the first step!
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Career Path Recommender
          </h1>
          <p className="text-lg text-gray-600">
            Discover your ideal career path with AI-powered recommendations
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep < 4 && renderProgressBar()}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderResults()}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={getRecommendations}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Getting Recommendations...
                    </>
                  ) : (
                    "Get My Recommendations"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerRec;
