import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";

// --- 1. Base Translation Data (English) ---
// This object now serves as the single source of truth.
// The keys and the English values are what we'll use to translate.
const baseTranslations = {
  en: {
    languageName: "English",
    common: {
      madeBy: "Multilingual App. All rights reserved.",
    },
    navigation: {
      home: "Home",
      about: "About Us",
      contact: "Contact",
    },
    homePage: {
      title: "Welcome to Our Dynamic Website!",
      header: "Explore the World with Us",
      description:
        "This application now uses the Gemini API for real-time translation. Any component, on any page, can now be translated dynamically.",
    },
  },
};

// A mapping of language codes to their native names and the names Gemini API understands.
const supportedLanguages = {
  en: { name: "English", geminiName: "English" },
  hi: { name: "हिन्दी", geminiName: "Hindi" },
  mr: { name: "मराठी", geminiName: "Marathi" },
  es: { name: "Español", geminiName: "Spanish" },
  fr: { name: "Français", geminiName: "French" },
  de: { name: "Deutsch", geminiName: "German" },
  ja: { name: "日本語", geminiName: "Japanese" },
};

// --- 2. Language Context ---
const LanguageContext = createContext();

// --- 3. Language Provider with Gemini API Integration ---
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  // State to hold all translations, including those fetched from the API.
  const [translations, setTranslations] = useState(baseTranslations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GEMINI API INTEGRATION ---
  const translateTextWithGemini = useCallback(
    async (targetLanguageCode) => {
      // Don't translate if the target is English (it's our base)
      if (targetLanguageCode === "en") return;
      // Check if we already have this language cached
      if (translations[targetLanguageCode]) return;

      setIsLoading(true);
      setError(null);
      console.log(`Fetching translations for ${targetLanguageCode}...`);

      // API Key has been inserted here.
      const apiKey = "AIzaSyDQ7V1wsI8CuqDRW4Idwnyvg0VlZNP6Ywk";

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      // Flatten the English translation object to a simple key-value pair
      const englishTexts = {};
      const flatten = (obj, path = "") => {
        for (let key in obj) {
          const newPath = path ? `${path}.${key}` : key;
          if (typeof obj[key] === "object" && obj[key] !== null) {
            flatten(obj[key], newPath);
          } else {
            englishTexts[newPath] = obj[key];
          }
        }
      };
      flatten(baseTranslations.en);

      // Construct the prompt for the Gemini API
      const targetLanguageName =
        supportedLanguages[targetLanguageCode].geminiName;
      const textToTranslate = JSON.stringify(englishTexts, null, 2);
      const prompt = `Translate the JSON object values below from English to ${targetLanguageName}. Maintain the exact JSON structure and keys in your response. Only translate the string values. Respond with only the raw JSON object without any markdown formatting.
        
        ${textToTranslate}
        `;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `API call failed with status: ${response.status}. ${errorBody.error.message}`
          );
        }

        const result = await response.json();

        if (!result.candidates || !result.candidates[0].content.parts[0].text) {
          throw new Error("Invalid response structure from API.");
        }

        const translatedText = result.candidates[0].content.parts[0].text;

        // Clean the response from the API, removing markdown formatting
        const cleanedJsonString = translatedText
          .replace(/```json\n|```/g, "")
          .trim();
        const translatedJson = JSON.parse(cleanedJsonString);

        // Reconstruct the nested object structure from the flattened keys
        const reconstructed = {};
        for (const key in translatedJson) {
          const parts = key.split(".");
          let current = reconstructed;
          for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]] = current[parts[i]] || {};
          }
          current[parts[parts.length - 1]] = translatedJson[key];
        }

        // Update the state with the new translations
        setTranslations((prev) => ({
          ...prev,
          [targetLanguageCode]: {
            ...reconstructed,
            languageName: supportedLanguages[targetLanguageCode].name,
          },
        }));
      } catch (error) {
        console.error("Error translating text:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [translations]
  ); // Dependency on translations to avoid re-fetching

  // Effect to trigger translation when language changes
  useEffect(() => {
    translateTextWithGemini(language);
  }, [language, translateTextWithGemini]);

  // The 't' function now gets data from the dynamic translations state
  const t = (key) => {
    const keys = key.split(".");
    let result = translations[language] || translations["en"]; // Fallback to English
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    isLoading,
    error,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// --- 4. Custom Hook: useTranslation ---
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

// --- 5. Components ---

const LanguageDropdown = () => {
  const { language, setLanguage, isLoading } = useTranslation();
  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        disabled={isLoading}
        className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {Object.keys(supportedLanguages).map((langKey) => (
          <option key={langKey} value={langKey}>
            {supportedLanguages[langKey].name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

const Navigation = () => {
  const { t } = useTranslation();
  return (
    <div className="hidden md:flex items-center space-x-6">
      <a
        href="#"
        className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
      >
        {t("navigation.home")}
      </a>
      <a
        href="#"
        className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
      >
        {t("navigation.about")}
      </a>
      <a
        href="#"
        className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
      >
        {t("navigation.contact")}
      </a>
    </div>
  );
};

const PageContent = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
        {t("homePage.title")}
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-400 bg-clip-text text-transparent mb-8">
        {t("homePage.header")}
      </h2>
      <p className="text-gray-600 leading-relaxed text-lg max-w-2xl mx-auto">
        {t("homePage.description")}
      </p>
    </>
  );
};

// --- 6. Main App Component ---
function App() {
  const { t, isLoading, error } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans text-gray-800">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
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
                className="inline-block w-8 h-8 mr-2 -mt-1"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                <path d="M12 2.5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5z"></path>
                <path d="M2.5 12a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1-5 0zM16.5 12a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1-5 0zM12 16.5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5z"></path>
              </svg>
              MultiLang
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Navigation />
            <LanguageDropdown />
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div
          className={`bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto text-center border border-gray-200/50 relative`}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-20">
              <svg
                className="animate-spin h-10 w-10 text-indigo-600"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          {error && (
            <div className="absolute -bottom-16 left-0 right-0 p-4">
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md mx-auto shadow-lg"
                role="alert"
              >
                <strong className="font-bold">Translation Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}
          <div
            className={`transition-opacity duration-300 ${
              isLoading ? "opacity-20" : "opacity-100"
            }`}
          >
            <PageContent />
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} {t("common.madeBy")}
        </p>
      </footer>
    </div>
  );
}

// --- 7. App Wrapper ---
export default function AppWrapper() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
