import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";

// Base translations (English)
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
    auth: {
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
    },
    // Add more translation keys as needed for your pages
  },
};

const supportedLanguages = {
  en: { name: "English", geminiName: "English" },
  hi: { name: "हिन्दी", geminiName: "Hindi" },
  mr: { name: "मराठी", geminiName: "Marathi" },
  es: { name: "Español", geminiName: "Spanish" },
  fr: { name: "Français", geminiName: "French" },
  de: { name: "Deutsch", geminiName: "German" },
  ja: { name: "日本語", geminiName: "Japanese" },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(baseTranslations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const translateTextWithGemini = useCallback(
    async (targetLanguageCode) => {
      if (targetLanguageCode === "en") return;
      if (translations[targetLanguageCode]) return;

      setIsLoading(true);
      setError(null);

      const apiKey = "AIzaSyDQ7V1wsI8CuqDRW4Idwnyvg0VlZNP6Ywk";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

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
        const cleanedJsonString = translatedText
          .replace(/```json\n|```/g, "")
          .trim();
        const translatedJson = JSON.parse(cleanedJsonString);

        const reconstructed = {};
        for (const key in translatedJson) {
          const parts = key.split(".");
          let current = reconstructed;
          for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]] = current[parts[i]] || {};
          }
          current[parts[parts.length - 1]] = translatedJson[key];
        }

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
  );

  useEffect(() => {
    translateTextWithGemini(language);
  }, [language, translateTextWithGemini]);

  const t = (key) => {
    const keys = key.split(".");
    let result = translations[language] || translations["en"];
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
    supportedLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
