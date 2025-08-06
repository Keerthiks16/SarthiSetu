import { useState } from "react";
import ReactMarkdown from "react-markdown";

// --- WARNING ---
// It is highly insecure to embed API keys directly in frontend code.
const API_KEY = "AIzaSyAx4CfWTqo6d9carq0uWcbc3btS3S5mSvA";

// --- Reusable Icon Components ---
const ChildCareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 mx-auto mb-3 text-indigo-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75zm-.75 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.75 0h.008v.015h-.008V9.75z"
    />
  </svg>
);

const TransportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 mx-auto mb-3 text-indigo-600"
  >
    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5a1.125 1.125 0 001.125-1.125V6.75a1.125 1.125 0 00-1.125-1.125H4.5A1.125 1.125 0 003.375 6.75v10.5a1.125 1.125 0 001.125 1.125z" />
  </svg>
);

const DigitalAccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 mx-auto mb-3 text-indigo-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
    />
  </svg>
);

function SahayogaSupportHelper() {
  const [selectedBarrier, setSelectedBarrier] = useState(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const barriers = [
    { name: "Childcare", icon: <ChildCareIcon /> },
    { name: "Transport", icon: <TransportIcon /> },
    { name: "Digital Access", icon: <DigitalAccessIcon /> },
  ];

  const handleGetSupport = async () => {
    if (!selectedBarrier) {
      setError("Please select a support category first.");
      return;
    }
    if (!problemDescription) {
      setError("Please describe your problem.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSolution("");

    const prompt = `
      You are an expert and empathetic support assistant for 'Sahayoga', an employment platform for marginalized communities in India.
      Your goal is to provide a helpful, actionable, and localized support plan.

      Current Location: Mumbai, Maharashtra, India.
      Current Date: August 7, 2025.

      User's Barrier Category: ${selectedBarrier}
      User's Problem Description: "${problemDescription}"

      Your Task:
      1.  Acknowledge the user's problem with empathy.
      2.  Provide a clear, step-by-step plan to address their issue.
      3.  Use simple, easy-to-understand language (like Hinglish or simple English).
      4.  Provide specific, plausible, and localized examples relevant to Mumbai.
      5.  Format your response using Markdown for readability (headings, bullet points).
      6.  End with an encouraging and empowering message.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setSolution(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("No content received from the API.");
      }
    } catch (e) {
      setError(`Failed to get help. ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
              Sahayoga Support Center
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              सहारा: आपकी हर चुनौती में आपके साथ
            </p>
          </div>

          {/* Step 1: Select Barrier */}
          <div className="mb-8">
            <label className="block text-xl font-semibold text-gray-800 mb-4 text-center">
              What kind of help do you need?
            </label>
            <div className="grid grid-cols-3 gap-4">
              {barriers.map((barrier) => (
                <button
                  key={barrier.name}
                  onClick={() => setSelectedBarrier(barrier.name)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                    selectedBarrier === barrier.name
                      ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200"
                      : "bg-gray-50 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {barrier.icon}
                  <span className="font-semibold text-gray-800">
                    {barrier.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Describe Problem */}
          <div className="mb-8">
            <label
              htmlFor="problem"
              className="block text-xl font-semibold text-gray-800 mb-3 text-center"
            >
              Tell us more about your problem
            </label>
            <textarea
              id="problem"
              rows="5"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Example: I have an interview in Bandra next week but I live in Thane. I don't know the best way to travel and I need to find a cheap daycare for my 3-year-old child for that day."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleGetSupport}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Support Plan...
              </>
            ) : (
              "Get Support Plan"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Solution Display Area */}
          {solution && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                Your Personalized Support Plan
              </h2>
              <div className="bg-gray-50 p-5 rounded-lg prose prose-indigo max-w-none">
                <ReactMarkdown>{solution}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center text-gray-500 mt-10 text-sm">
          <p>&copy; 2025 Sahayoga Platform. Empowering Futures.</p>
        </footer>
      </div>
    </div>
  );
}

export default SahayogaSupportHelper;
