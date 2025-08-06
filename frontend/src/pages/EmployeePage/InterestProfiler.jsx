import { useState, useEffect } from "react";
import {
  BookOpen,
  Code,
  FlaskConical,
  Paintbrush,
  Music,
  Globe,
  Calculator,
  HeartPulse,
  Leaf,
  Briefcase,
  Lightbulb,
  TrendingUp,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";

const InterestProfiler = () => {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    age: "",
    education: "",
    goals: "",
  });

  const interestCategories = [
    {
      id: "technology",
      name: "Technology",
      icon: <Code className="w-5 h-5" />,
    },
    {
      id: "science",
      name: "Science",
      icon: <FlaskConical className="w-5 h-5" />,
    },
    { id: "arts", name: "Arts", icon: <Paintbrush className="w-5 h-5" /> },
    { id: "music", name: "Music", icon: <Music className="w-5 h-5" /> },
    { id: "languages", name: "Languages", icon: <Globe className="w-5 h-5" /> },
    {
      id: "math",
      name: "Mathematics",
      icon: <Calculator className="w-5 h-5" />,
    },
    { id: "health", name: "Health", icon: <HeartPulse className="w-5 h-5" /> },
    {
      id: "environment",
      name: "Environment",
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      id: "business",
      name: "Business",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: "philosophy",
      name: "Philosophy",
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      id: "economics",
      name: "Economics",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "psychology",
      name: "Psychology",
      icon: <User className="w-5 h-5" />,
    },
  ];

  const questions = {
    technology: [
      "How interested are you in learning programming languages?",
      "Do you enjoy solving problems using technology?",
      "How curious are you about emerging technologies like AI or blockchain?",
    ],
    science: [
      "How fascinated are you by scientific discoveries?",
      "Do you enjoy conducting experiments or researching how things work?",
      "How interested are you in space exploration or quantum physics?",
    ],
    arts: [
      "How often do you engage in creative activities like drawing or painting?",
      "Do you appreciate analyzing art styles and art history?",
      "How interested are you in developing artistic skills?",
    ],
    music: [
      "How important is music in your daily life?",
      "Do you play any musical instruments or want to learn?",
      "How interested are you in music theory or composition?",
    ],
    languages: [
      "How interested are you in learning new languages?",
      "Do you enjoy exploring different cultures through their languages?",
      "How motivated are you to become fluent in another language?",
    ],
    math: [
      "How comfortable are you with mathematical concepts?",
      "Do you enjoy solving complex mathematical problems?",
      "How interested are you in advanced mathematics or its applications?",
    ],
    health: [
      "How interested are you in human anatomy and physiology?",
      "Do you enjoy learning about nutrition and healthy living?",
      "How curious are you about medical advancements?",
    ],
    environment: [
      "How concerned are you about environmental issues?",
      "Do you enjoy learning about ecosystems and sustainability?",
      "How interested are you in environmental science or conservation?",
    ],
    business: [
      "How interested are you in entrepreneurship?",
      "Do you enjoy analyzing market trends and business strategies?",
      "How curious are you about startup culture or corporate management?",
    ],
    philosophy: [
      "How often do you ponder deep questions about existence?",
      "Do you enjoy reading philosophical works?",
      "How interested are you in logic, ethics, or metaphysics?",
    ],
    economics: [
      "How interested are you in understanding how economies function?",
      "Do you enjoy analyzing economic policies and their impacts?",
      "How curious are you about global economic trends?",
    ],
    psychology: [
      "How interested are you in understanding human behavior?",
      "Do you enjoy learning about cognitive processes and mental health?",
      "How curious are you about psychological research?",
    ],
  };

  const handleInterestToggle = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleResponseChange = (category, questionIndex, value) => {
    setResponses({
      ...responses,
      [category]: {
        ...responses[category],
        [questionIndex]: value,
      },
    });
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const generateLearningPath = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare the prompt for Gemini API
      let prompt = `Create a comprehensive learning path based on the following information:
      
      User Profile:
      - Name: ${userInfo.name || "Not provided"}
      - Age: ${userInfo.age || "Not provided"}
      - Education Level: ${userInfo.education || "Not provided"}
      - Goals: ${userInfo.goals || "Not provided"}
      
      Selected Interest Areas: ${interests.join(", ")}
      
      Interest Assessment Responses:`;

      // Add responses to the prompt
      interests.forEach((interest) => {
        prompt += `\n\n${interest.toUpperCase()}:\n`;
        questions[interest].forEach((q, i) => {
          prompt += `- ${q}: ${responses[interest]?.[i] || "No response"}\n`;
        });
      });

      prompt += `\n\nPlease provide:
      1. A personalized learning path with 3-5 key areas to focus on
      2. Recommended resources for each area (books, courses, websites)
      3. Suggested timeline for progression
      4. Tips for staying motivated
      5. Potential career paths related to these interests
      
      Format the response in clear, organized sections with markdown-style headings.`;

      const apiKey =
        // process.env.REACT_APP_GEMINI_API_KEY ||
        "AIzaSyAc1bvHBsMD2U6o0LvzC_dniaT3qTeClVc";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated";

      setLearningPath(generatedText);
      setStep(4);
    } catch (err) {
      setError(`Error generating learning path: ${err.message}`);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (optional)
                </label>
                <input
                  type="number"
                  name="age"
                  value={userInfo.age}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your age"
                  min="10"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level (optional)
                </label>
                <select
                  name="education"
                  value={userInfo.education}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your education level</option>
                  <option value="High School">High School</option>
                  <option value="Some College">Some College</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD or higher">PhD or higher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Goals (optional)
                </label>
                <textarea
                  name="goals"
                  value={userInfo.goals}
                  onChange={handleUserInfoChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your learning goals or what you hope to achieve"
                  rows={3}
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              Next <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Select Your Interest Areas
            </h2>
            <p className="text-gray-600 text-center">
              Choose at least 3 areas you're interested in learning about
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleInterestToggle(category.id)}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition duration-200 ${
                    interests.includes(category.id)
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`mb-2 p-2 rounded-full ${
                      interests.includes(category.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={interests.length < 3}
                className={`${
                  interests.length < 3
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center`}
              >
                Next <ChevronRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Interest Assessment
            </h2>
            <p className="text-gray-600 text-center">
              Rate your interest in the following statements
            </p>

            <div className="space-y-8">
              {interests.map((interest) => (
                <div key={interest} className="space-y-4">
                  <h3 className="text-lg font-semibold capitalize flex items-center">
                    {interestCategories.find((c) => c.id === interest)?.icon}
                    <span className="ml-2">{interest}</span>
                  </h3>
                  {questions[interest].map((question, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-sm font-medium">{question}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Not at all</span>
                        <span>Neutral</span>
                        <span>Very interested</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={responses[interest]?.[index] || 3}
                        onChange={(e) =>
                          handleResponseChange(
                            interest,
                            index,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <span key={num} className="w-4 text-center">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              <button
                onClick={generateLearningPath}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Learning Path{" "}
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Your Personalized Learning Path
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {learningPath ? (
              <div className="prose max-w-none bg-white p-6 rounded-lg border">
                {learningPath.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("#")) {
                    const level = paragraph.match(/^#+/)?.[0]?.length || 0;
                    const text = paragraph.replace(/^#+\s*/, "");
                    return React.createElement(
                      `h${Math.min(level + 2, 6)}`,
                      { key: index, className: `mt-4 mb-2 font-bold` },
                      text
                    );
                  }
                  return (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No learning path generated yet</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setInterests([]);
                  setResponses({});
                  setLearningPath(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <BookOpen className="mr-2 text-blue-600" />
            Learning Path Profiler
          </h1>
          <p className="mt-2 text-gray-600">
            Discover your ideal learning journey based on your interests
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className="text-xs mt-1 text-gray-500">
                    {stepNum === 1
                      ? "Info"
                      : stepNum === 2
                      ? "Interests"
                      : stepNum === 3
                      ? "Assessment"
                      : "Results"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {renderStep()}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your data is processed securely and not stored permanently.</p>
        </div>
      </div>
    </div>
  );
};

export default InterestProfiler;
