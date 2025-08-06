import { useCallback, useEffect, useState } from "react";

// --- Helper Components ---

const Loader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div
        className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin absolute top-2 left-2 animate-pulse"
        style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
      ></div>
    </div>
    <p className="mt-6 text-gray-700 font-semibold text-lg">{text}</p>
    <div className="flex space-x-1 mt-2">
      <div
        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  </div>
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full m-4 transform transition-all duration-500 scale-95 animate-modal-pop border-2 border-gray-100">
      {children}
    </div>
  </div>
);

// --- Icon Components (for better UI) ---
const Icon = ({ name, className }) => {
  const icons = {
    "data-scientist": <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />,
    "business-analyst": (
      <>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </>
    ),
    "web-developer": (
      <>
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </>
    ),
    "ux-designer": (
      <path
        d="M21.12.88a2.83 2.83 0 0 0-4 0L2.5 15.44a2.83 2.83 0 0 0 0 4L8.56 25a2.83 2.83 0 0 0 4 0L27.12 10.44a2.83 2.83 0 0 0 0-4Z"
        transform="scale(0.8) translate(2, -2)"
      />
    ),
    "product-manager": (
      <>
        <path d="M2 9.5A2.5 2.5 0 0 1 4.5 7h15A2.5 2.5 0 0 1 22 9.5v10A2.5 2.5 0 0 1 19.5 22h-15A2.5 2.5 0 0 1 2 19.5Z" />
        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <path d="M12 12h.01" />
        <path d="M12 17h.01" />
      </>
    ),
    "cybersecurity-analyst": (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    ),
    "digital-marketer": (
      <>
        <path d="M12 12c-2.32 0-4.36.8-5.88 2.12V12" />
        <path d="M12 12c2.32 0 4.36.8 5.88 2.12V12" />
        <path d="M12 12v8m0-8c-4.42 0-8 2.69-8 6v2c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-2c0-3.31-3.58-6-8-6" />
      </>
    ),
    "graphic-designer": (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m12 16.5-3.5-7 7 0-3.5 7Z" />
      </>
    ),
    "artisan-entrepreneur": (
      <>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m10 14-2 2 2 2" />
        <path d="m14 18 2-2-2-2" />
      </>
    ),
    "community-health-worker": (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M9 12H5" />
        <path d="M7 10v4" />
      </>
    ),
    "organic-farmer": (
      <>
        <path d="M12 22c-2 0-4-1-4-2 0-1.5 3-4 3-6 0-1.5-2-3.5-2-5 0-2.5 2.5-4 4-4s4 1.5 4 4c0 1.5-2 3.5-2 5 0 2 3 4.5 3 6 0 1-2 2-4 2z" />
        <path d="M12 22c-2.5 0-4-1.5-4-4 0-2.5 2.5-4 2.5-6s-2-3-2-4.5c0-2 2-3.5 3.5-3.5s3.5 1.5 3.5 3.5c0 1.5-2 3-2 4.5s2.5 3.5 2.5 6c0 2.5-1.5 4-4 4z" />
      </>
    ),
    "solar-technician": (
      <>
        <path d="M12 12h.01" />
        <path d="M14.31 8.69a4.99 4.99 0 0 0-8.62 0" />
        <path d="M8.69 14.31a4.99 4.99 0 0 0 8.62 0" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.93 19.07 1.41-1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
      </>
    ),
    "microfinance-officer": (
      <>
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M13 12h-2v2h2v-2zm-2-1h2V9h-2v2z" />
      </>
    ),
    "water-management": (
      <>
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0L12 2.69z" />
        <path d="M12 12a3 3 0 0 0-3 3c0 1.66 2 3 3 3s3-1.34 3-3a3 3 0 0 0-3-3z" />
      </>
    ),
    "esl-teacher": (
      <>
        <path d="M10 14v3m0 0v2m0-2h4m-4 0H6" />
        <path d="M18 8a4 4 0 1 0-8 0c0 2.44 1.57 4.47 3.69 5.5" />
        <path d="M12.5 13.04A6.43 6.43 0 0 1 12 13a6.5 6.5 0 0 1-6.23-4.7" />
      </>
    ),
    "social-worker": (
      <>
        <path d="M14 18.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
        <path d="M14 8.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
        <path d="M5 18.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
        <path d="M5 8.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
      </>
    ),
    "mobile-app-developer": (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </>
    ),
    "it-support": (
      <>
        <path d="M18 16v-4c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4v4" />
        <path d="M8 16H4a2 2 0 0 1-2-2v-2c0-1.1.9-2 2-2h0" />
        <path d="M16 16h4a2 2 0 0 0 2-2v-2c0-1.1-.9-2-2-2h0" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    "ecotourism-guide": (
      <>
        <path d="M12.48 2.41 6.8 7.82a2 2 0 0 0-.5.81L5 13l4.38-.29a2 2 0 0 0 .8-.48l5.67-5.41a2.1 2.1 0 0 0-2.87-3.01Z" />
        <path d="M15 8 9 14" />
        <path d="M22 22 18 18" />
      </>
    ),
    "supply-chain": (
      <>
        <path d="M2 8h20" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="2" y="8" width="20" height="12" rx="2" />
      </>
    ),
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || ""}
    </svg>
  );
};

// --- Main App Component ---
export default function App() {
  // --- State Management ---
  const [apiKey] = useState("AIzaSyAc1bvHBsMD2U6o0LvzC_dniaT3qTeClVc");

  const [username, setUsername] = useState("");
  const [page, setPage] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [error, setError] = useState(null);

  const [careerTopics] = useState([
    { id: "web-developer", name: "Web Developer", icon: "web-developer" },
    {
      id: "mobile-app-developer",
      name: "Mobile App Developer",
      icon: "mobile-app-developer",
    },
    { id: "data-scientist", name: "Data Scientist", icon: "data-scientist" },
    {
      id: "cybersecurity-analyst",
      name: "Cybersecurity Analyst",
      icon: "cybersecurity-analyst",
    },
    { id: "it-support", name: "IT Support Specialist", icon: "it-support" },
    {
      id: "digital-marketer",
      name: "Digital Marketer",
      icon: "digital-marketer",
    },
    {
      id: "graphic-designer",
      name: "Graphic Designer",
      icon: "graphic-designer",
    },
    { id: "ux-designer", name: "UX/UI Designer", icon: "ux-designer" },
    { id: "product-manager", name: "Product Manager", icon: "product-manager" },
    {
      id: "business-analyst",
      name: "Business Analyst",
      icon: "business-analyst",
    },
    { id: "social-worker", name: "Social Worker", icon: "social-worker" },
    {
      id: "community-health-worker",
      name: "Community Health Worker",
      icon: "community-health-worker",
    },
    { id: "esl-teacher", name: "ESL Teacher", icon: "esl-teacher" },
    {
      id: "ecotourism-guide",
      name: "Ecotourism Guide",
      icon: "ecotourism-guide",
    },
    { id: "organic-farmer", name: "Organic Farmer", icon: "organic-farmer" },
    {
      id: "solar-technician",
      name: "Solar Technician",
      icon: "solar-technician",
    },
    {
      id: "artisan-entrepreneur",
      name: "Artisan Entrepreneur",
      icon: "artisan-entrepreneur",
    },
    {
      id: "microfinance-officer",
      name: "Microfinance Officer",
      icon: "microfinance-officer",
    },
    {
      id: "water-management",
      name: "Water Resource Mgmt",
      icon: "water-management",
    },
    {
      id: "supply-chain",
      name: "Supply Chain Coordinator",
      icon: "supply-chain",
    },
  ]);
  const [filteredTopics, setFilteredTopics] = useState(careerTopics);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // --- Effects for Initialization and Storage ---
  useEffect(() => {
    // Load Tailwind CSS if not already loaded
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);

      // Configure Tailwind
      window.tailwind = {
        config: {
          theme: {
            extend: {
              animation: {
                "modal-pop":
                  "modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                "fade-in": "fade-in 0.8s ease-out forwards",
                float: "float 20s infinite linear",
              },
            },
          },
        },
      };
    }

    const storedUsername = "";
    const storedLeaderboard = [];
    setUsername(storedUsername);
    setLeaderboard(storedLeaderboard);
    if (!storedUsername) {
      setShowUsernameModal(true);
    }
  }, []);

  useEffect(() => {
    if (username) {
      setShowUsernameModal(false);
    }
  }, [username]);

  // --- API & AI Logic ---
  const callGemini = useCallback(
    async (prompt, jsonSchema) => {
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        setError("Please add your Gemini API key in the code.");
        throw new Error("API key is missing.");
      }
      setError(null);
      setIsLoading(true);

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: jsonSchema,
        },
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            errorBody.error.message ||
              `API request failed: ${response.statusText}`
          );
        }
        const result = await response.json();
        return JSON.parse(result.candidates[0].content.parts[0].text);
      } catch (err) {
        console.error("API call error:", err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  // --- Handlers ---
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredTopics(
      careerTopics.filter((t) => t.name.toLowerCase().includes(searchTerm))
    );
  };

  const handleSelectTopic = async (topic) => {
    setCurrentTopic(topic);
    setPage("quiz-list");
    setLoadingText(`Generating quizzes for ${topic.name}...`);
    try {
      const prompt = `Generate a list of 6 diverse quiz topics for a ${topic.name}. Make sure there are two quizzes for each difficulty: Easy, Medium, and Hard. For each quiz, provide a unique id (string, snake_case), a title (string), a difficulty (Easy, Medium, or Hard), and points (number: 10 for Easy, 25 for Medium, 50 for Hard).`;
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            title: { type: "STRING" },
            difficulty: { type: "STRING" },
            points: { type: "NUMBER" },
          },
          required: ["id", "title", "difficulty", "points"],
        },
      };
      const generatedQuizzes = await callGemini(prompt, schema);
      setQuizzes(generatedQuizzes);
    } catch (err) {
      /* Error is handled by callGemini */
    }
  };

  const handleStartQuiz = async (quiz) => {
    setCurrentQuiz(quiz);
    setPage("quiz");
    setLoadingText(`Creating your ${quiz.title} quiz...`);
    try {
      const prompt = `Generate 5 multiple-choice questions for a quiz titled "${quiz.title}" within the topic of ${currentTopic.name}. For each question, provide the question text, an array of 4 unique options, and a string containing the exact text of the correct answer from the options array.`;
      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            answer: { type: "STRING" },
          },
          required: ["question", "options", "answer"],
        },
      };
      const generatedQuestions = await callGemini(prompt, schema);
      const processedQuestions = generatedQuestions.map((q) => ({
        ...q,
        shuffledOptions: [...q.options].sort(() => Math.random() - 0.5),
      }));
      setQuestions(processedQuestions);
    } catch (err) {
      /* Error handling */
    }
  };

  // --- Component Render ---
  const renderPage = () => {
    switch (page) {
      case "quiz-list":
        return (
          <QuizListPage
            topic={currentTopic}
            quizzes={quizzes}
            onStartQuiz={handleStartQuiz}
            onBack={() => setPage("home")}
            isLoading={isLoading}
            loadingText={loadingText}
            error={error}
          />
        );
      case "quiz":
        return (
          <QuizPage
            quiz={currentQuiz}
            questions={questions}
            onBack={() => setPage("quiz-list")}
            isLoading={isLoading}
            loadingText={loadingText}
            error={error}
            username={username}
            setLeaderboard={setLeaderboard}
          />
        );
      case "leaderboard":
        return <LeaderboardPage leaderboard={leaderboard} />;
      default:
        return (
          <HomePage
            topics={filteredTopics}
            onSelectTopic={handleSelectTopic}
            onSearch={handleSearch}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen font-sans relative overflow-hidden">
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'); 
          body { font-family: 'Inter', sans-serif; } 
          
          .animate-modal-pop { animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; } 
          @keyframes modal-pop { 
              from { transform: scale(0.8) rotate(-3deg); opacity: 0; } 
              to { transform: scale(1) rotate(0deg); opacity: 1; } 
          } 
          
          .animate-fade-in { animation: fade-in 0.8s ease-out forwards; } 
          @keyframes fade-in { 
              from { opacity: 0; transform: translateY(20px); } 
              to { opacity: 1; transform: translateY(0); } 
          } 
          
          .floating-shapes {
              position: absolute;
              width: 100%;
              height: 100%;
              overflow: hidden;
              z-index: -1;
          }
          
          .shape {
              position: absolute;
              border-radius: 50%;
              opacity: 0.1;
              animation: float 20s infinite linear;
          }
          
          .shape:nth-child(1) {
              width: 80px;
              height: 80px;
              background: linear-gradient(45deg, #4f46e5, #4f46e5);
              top: 20%;
              left: 10%;
              animation-delay: 0s;
          }
          
          .shape:nth-child(2) {
              width: 120px;
              height: 120px;
              background: linear-gradient(45deg, #4f46e5, #4f46e5);
              top: 60%;
              right: 15%;
              animation-delay: -5s;
          }
          
          .shape:nth-child(3) {
              width: 60px;
              height: 60px;
              background: linear-gradient(45deg, #4f46e5, #4f46e5);
              bottom: 30%;
              left: 20%;
              animation-delay: -10s;
          }
          
          @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-20px) rotate(90deg); }
              50% { transform: translateY(-10px) rotate(180deg); }
              75% { transform: translateY(-30px) rotate(270deg); }
          }
          
          .glass-effect {
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.18);
          }
          
          .gradient-border {
              position: relative;
              background: linear-gradient(45deg, #4f46e5, #4f46e5);
              padding: 3px;
              border-radius: 20px;
          }
          
          .gradient-border-inner {
              background: white;
              border-radius: 17px;
              height: 100%;
              width: 100%;
          }
          
          .quiz-glow {
              box-shadow: 0 0 30px rgba(79, 70, 229, 0.3);
          }
          
          .quiz-glow:hover {
              box-shadow: 0 0 40px rgba(79, 70, 229, 0.5);
          }
        `}</style>

      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {showUsernameModal && (
        <Modal>
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-indigo-600">
              Welcome Champion!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Ready to test your career knowledge? Enter your name to begin your
              journey!
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUsername(e.target.elements.username.value);
            }}
          >
            <input
              type="text"
              name="username"
              placeholder="Enter your awesome name"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all mb-6 text-lg font-medium"
              required
            />
            <button
              type="submit"
              className="w-full px-8 py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            >
              🚀 Start My Quest
            </button>
          </form>
        </Modal>
      )}

      <div className="w-full p-4 md:p-8">
        <Header onNavigate={setPage} />
        <main className="mt-8">{renderPage()}</main>
      </div>
    </div>
  );
}

// --- Page & UI Components ---

const Header = ({ onNavigate }) => (
  <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center pb-6 border-b-2 border-gray-200">
    <div className="mb-4 sm:mb-0">
      <h1 className="text-4xl font-black text-indigo-600">
        🎯 Career Quiz Challenge
      </h1>
      <p className="text-gray-500 mt-1 font-medium">
        Test your skills, climb the ranks!
      </p>
    </div>
    <nav className="flex space-x-3 glass-effect p-2 rounded-2xl shadow-lg">
      <button
        onClick={() => onNavigate("home")}
        className="px-6 py-3 text-gray-700 hover:text-white hover:bg-indigo-600 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-sm"
      >
        🏠 Home
      </button>
      <button
        onClick={() => onNavigate("leaderboard")}
        className="px-6 py-3 text-gray-700 hover:text-white hover:bg-indigo-600 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-sm"
      >
        🏆 Leaderboard
      </button>
    </nav>
  </header>
);

const HomePage = ({ topics, onSelectTopic, onSearch }) => (
  <div className="animate-fade-in max-w-7xl mx-auto w-full">
    <div className="text-center mb-16">
      <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-6">
        Choose Your
        <span className="block text-indigo-600">Career Path</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Discover your potential, challenge yourself, and become the ultimate
        career champion! 🌟
      </p>
    </div>
    <div className="mb-16 max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          onChange={onSearch}
          placeholder="🔍 Search for your dream career (e.g., Web Developer)"
          className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-lg text-lg font-medium glass-effect"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {topics.map((topic, index) => (
        <div
          key={topic.id}
          onClick={() => onSelectTopic(topic)}
          className="gradient-border cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-2 quiz-glow group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="gradient-border-inner p-8 text-center">
            <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-3xl bg-indigo-100 text-indigo-600 mb-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
              <Icon name={topic.icon} className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {topic.name}
            </h3>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                Start Quiz →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuizListPage = ({
  topic,
  quizzes,
  onStartQuiz,
  onBack,
  isLoading,
  loadingText,
  error,
}) => (
  <div className="animate-fade-in max-w-5xl mx-auto w-full">
    <button
      onClick={onBack}
      className="mb-10 inline-flex items-center px-6 py-3 border-2 border-gray-300 text-lg font-semibold rounded-xl shadow-lg text-gray-700 bg-white hover:bg-gray-50 transition-all hover:scale-105"
    >
      ← Back to Career Paths
    </button>
    <div className="text-center mb-12">
      <h2 className="text-4xl font-black mb-4 text-indigo-600">
        {topic?.name} Quizzes
      </h2>
      <p className="text-lg text-gray-600">
        Choose your challenge level and earn points!
      </p>
    </div>

    {isLoading && <Loader text={loadingText} />}
    {error && (
      <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-2xl">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-red-700 font-semibold text-lg">{error}</p>
      </div>
    )}

    {!isLoading && !error && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.map((quiz, index) => {
          const difficultyColors = {
            Easy: "from-green-400 to-green-600",
            Medium: "from-yellow-400 to-orange-500",
            Hard: "from-red-400 to-red-600",
          };
          const difficultyEmojis = {
            Easy: "🌱",
            Medium: "🔥",
            Hard: "⚡",
          };

          return (
            <div
              key={quiz.id}
              onClick={() => onStartQuiz(quiz)}
              className="glass-effect p-8 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl group border-2 border-gray-100"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`px-4 py-2 bg-gradient-to-r ${
                    difficultyColors[quiz.difficulty]
                  } text-white font-bold rounded-xl text-sm shadow-lg`}
                >
                  {difficultyEmojis[quiz.difficulty]} {quiz.difficulty}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-600">
                    {quiz.points}
                  </div>
                  <div className="text-sm text-gray-500 font-semibold">
                    POINTS
                  </div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">
                {quiz.title}
              </h4>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-500 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="text-center mt-2 text-indigo-600 font-semibold">
                  Click to Start! 🚀
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const QuizPage = ({
  quiz,
  questions,
  onBack,
  isLoading,
  loadingText,
  error,
  username,
  setLeaderboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectAnswer = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    if (option === questions[currentIndex].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      const totalQuestions = questions.length;
      if (totalQuestions === 0) return;
      const pointsAwarded = Math.round((score / totalQuestions) * quiz.points);
      setLeaderboard((prev) => {
        const userIndex = prev.findIndex((u) => u.name === username);
        let newLeaderboard = [...prev];
        if (userIndex > -1) {
          newLeaderboard[userIndex].points += pointsAwarded;
        } else {
          newLeaderboard.push({ name: username, points: pointsAwarded });
        }
        return newLeaderboard.sort((a, b) => b.points - a.points);
      });
      setIsFinished(true);
    }
  };

  if (isLoading) return <Loader text={loadingText} />;
  if (error)
    return (
      <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-2xl max-w-2xl mx-auto">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-red-700 font-semibold text-lg">{error}</p>
      </div>
    );
  if (questions.length === 0 && !isLoading)
    return (
      <div className="text-center p-8 bg-yellow-100 border-2 border-gray-200 rounded-2xl max-w-2xl mx-auto">
        <div className="text-6xl mb-4">🤔</div>
        <p className="text-yellow-800 font-semibold text-lg">
          No questions generated. Please try again.
        </p>
      </div>
    );

  const currentQuestion = questions[currentIndex];

  if (isFinished) {
    const pointsAwarded = Math.round((score / questions.length) * quiz.points);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto w-full text-center glass-effect p-12 rounded-3xl shadow-2xl animate-fade-in border-2 border-gray-200">
        <div className="mb-8">
          <div className="text-8xl mb-4">
            {percentage >= 80
              ? "🎉"
              : percentage >= 60
              ? "👏"
              : percentage >= 40
              ? "👍"
              : "💪"}
          </div>
          <h2 className="text-4xl font-black mb-6 text-indigo-600">
            Quiz Completed!
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="text-3xl font-black text-green-600">{score}</div>
            <div className="text-green-600 font-semibold">Correct Answers</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="text-3xl font-black text-blue-600">
              {percentage}%
            </div>
            <div className="text-blue-600 font-semibold">Accuracy</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-200">
            <div className="text-3xl font-black text-indigo-600">
              {pointsAwarded}
            </div>
            <div className="text-indigo-600 font-semibold">Points Earned</div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-10 py-4 text-white font-bold bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
        >
          🎯 Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full glass-effect p-8 md:p-12 rounded-3xl shadow-2xl animate-fade-in border-2 border-gray-200">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg text-gray-600 font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-bold text-indigo-600">
              Score: {score}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
          <div
            className="bg-indigo-500 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-10 text-gray-800 leading-relaxed">
        {currentQuestion.question}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {currentQuestion.shuffledOptions.map((option, i) => {
          const isCorrect = option === currentQuestion.answer;
          const isSelected = option === selectedAnswer;
          let buttonClass =
            "p-6 border-3 border-gray-200 rounded-2xl text-left hover:border-indigo-500 transition-all disabled:cursor-not-allowed font-semibold text-lg bg-white shadow-lg hover:shadow-xl transform hover:scale-105";

          if (selectedAnswer) {
            if (isCorrect) {
              buttonClass +=
                " !border-green-500 !bg-green-100 text-green-800 !shadow-green-200";
            } else if (isSelected) {
              buttonClass +=
                " !border-red-500 !bg-red-50 text-red-700 !shadow-red-200";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelectAnswer(option)}
              disabled={!!selectedAnswer}
              className={buttonClass}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center mr-4 text-sm">
                  {String.fromCharCode(65 + i)}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-700">
          🎯 Correct Answers: <span className="text-indigo-600">{score}</span>
        </div>
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="px-10 py-4 text-white font-bold bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 text-lg disabled:transform-none"
        >
          {currentIndex === questions.length - 1
            ? "🏁 Finish Quiz"
            : "➡️ Next Question"}
        </button>
      </div>
    </div>
  );
};

const LeaderboardPage = ({ leaderboard }) => (
  <div className="animate-fade-in max-w-5xl mx-auto w-full">
    <div className="text-center mb-12">
      <h2 className="text-5xl font-black mb-4 text-indigo-600">
        🏆 Hall of Fame
      </h2>
      <p className="text-xl text-gray-600">
        The ultimate career quiz champions!
      </p>
    </div>

    <div className="glass-effect p-8 rounded-3xl shadow-2xl border-2 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[400px]">
          <thead>
            <tr className="border-b-3 border-gray-200">
              <th className="p-6 text-xl font-black text-indigo-600">
                🏅 Rank
              </th>
              <th className="p-6 text-xl font-black text-indigo-600">
                👤 Champion
              </th>
              <th className="p-6 text-xl font-black text-indigo-600">
                ⭐ Points
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, index) => {
                const rankEmojis = ["🥇", "🥈", "🥉"];
                const rankColors = [
                  "text-yellow-600 bg-yellow-50",
                  "text-gray-600 bg-gray-50",
                  "text-orange-600 bg-orange-50",
                ];

                return (
                  <tr
                    key={user.name + index}
                    className={`border-b-2 border-gray-100 hover:bg-gray-50 transition-colors ${
                      index < 3 ? rankColors[index] : "hover:bg-gray-25"
                    }`}
                  >
                    <td className="p-6 font-black text-2xl">
                      {index < 3 ? rankEmojis[index] : `#${index + 1}`}
                    </td>
                    <td className="p-6 font-bold text-gray-800 text-lg">
                      {user.name}
                    </td>
                    <td className="p-6 font-black text-indigo-600 text-xl">
                      {user.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-500 text-xl font-semibold">
                    No champions yet!
                  </p>
                  <p className="text-gray-400 mt-2">
                    Be the first to make your mark!
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
