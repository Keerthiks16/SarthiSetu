import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mic,
  MicOff,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Resume = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMethod, setInputMethod] = useState("text"); // 'voice', 'text'
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [outputLanguage, setOutputLanguage] = useState("english");
  const [isRecording, setIsRecording] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([
    "english",
    "hindi",
    "spanish",
    "french",
    "german",
    "chinese",
    "japanese",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [userData, setUserData] = useState({
    personal_info: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    objective: "",
    education: [
      {
        degree: "",
        institution: "",
        year: "",
        percentage: "",
      },
    ],
    experience: [
      {
        company: "",
        position: "",
        duration: "",
        description: "",
      },
    ],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    hobbies: [],
  });

  // Check if mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Mock API functions
  const mockFetchSupportedLanguages = () => {
    return Promise.resolve({
      success: true,
      languages: [
        "english",
        "hindi",
        "spanish",
        "french",
        "german",
        "chinese",
        "japanese",
      ],
    });
  };

  const mockTranslateText = (text, targetLang = "english") => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(text); // Return original text as mock translation
      }, 500);
    });
  };

  const mockProcessAudioToText = () => {
    return Promise.resolve("This is mock transcribed text from audio");
  };

  useEffect(() => {
    fetchSupportedLanguages();
    if (inputMethod === "voice") {
      requestMicrophonePermission();
    }
  }, [inputMethod]);

  const fetchSupportedLanguages = async () => {
    try {
      const data = await mockFetchSupportedLanguages();
      if (data.success) {
        setSupportedLanguages(data.languages);
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      setError("Failed to load supported languages");
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setError(
        "Microphone access is required for voice input. Please enable microphone permissions."
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const transcribedText = await processAudioToText(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        return transcribedText;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError("");
    } catch (error) {
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const transcribedText = await processAudioToText(audioBlob);
          resolve(transcribedText);
        };
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve("");
      }
    });
  };

  const processAudioToText = async (audioBlob) => {
    setLoading(true);
    try {
      const text = await mockProcessAudioToText();
      return text;
    } catch (error) {
      setError("Error processing audio");
      return "";
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text, targetLang = "english") => {
    try {
      if (selectedLanguage === "english" || !text.trim()) {
        return text;
      }

      const translatedText = await mockTranslateText(text, targetLang);
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    setUserData((prev) => {
      const newData = { ...prev };

      if (index !== null) {
        if (!newData[section][index]) {
          newData[section][index] = {};
        }
        newData[section][index][field] = value;
      } else if (section === "personal_info") {
        newData.personal_info = { ...newData.personal_info, [field]: value };
      } else if (Array.isArray(newData[section])) {
        if (field === "add") {
          newData[section] = [...newData[section], value];
        } else {
          newData[section] = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        }
      } else {
        newData[section] = value;
      }

      return newData;
    });
  };

  const addArrayItem = (section, defaultItem = {}) => {
    setUserData((prev) => ({
      ...prev,
      [section]: [...prev[section], defaultItem],
    }));
  };

  const removeArrayItem = (section, index) => {
    setUserData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const generateResume = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!userData.personal_info.name || !userData.personal_info.email) {
        throw new Error("Name and email are required fields");
      }

      // Mock PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a mock PDF download
      const mockPdfContent = `Resume for ${
        userData.personal_info.name
      }\n\nGenerated in ${outputLanguage.toUpperCase()}`;
      const blob = new Blob([mockPdfContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        userData.personal_info.name.replace(/\s+/g, "_") || "Resume"
      }_${outputLanguage}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("Resume generated and downloaded successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(error.message || "Error generating resume");
    } finally {
      setLoading(false);
    }
  };

  const VoiceInput = ({ onTextReceived, placeholder, currentValue = "" }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcriptionLoading, setTranscriptionLoading] = useState(false);

    const handleVoiceInput = async () => {
      if (isListening) {
        setTranscriptionLoading(true);
        const transcribedText = await stopRecording();
        setIsListening(false);
        setTranscriptionLoading(false);

        if (transcribedText && onTextReceived) {
          onTextReceived(transcribedText);
        }
      } else {
        setIsListening(true);
        await startRecording();
      }
    };

    useEffect(() => {
      if (!isRecording && isListening) {
        setIsListening(false);
      }
    }, [isRecording]);

    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={transcriptionLoading}
          className={`p-2 rounded-full transition-colors ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white disabled:opacity-50`}
        >
          {transcriptionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1">
          <span className="text-sm text-gray-600">
            {transcriptionLoading
              ? "Processing audio..."
              : isListening
              ? "Recording... Click mic to stop"
              : placeholder}
          </span>
          {currentValue && (
            <div className="text-xs text-gray-500 mt-1 truncate">
              Current: {currentValue}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TextInput = ({ value, onChange, placeholder, multiline = false }) => {
    const [isTranslating, setIsTranslating] = useState(false);

    const handleChange = async (e) => {
      const text = e.target.value;
      onChange(text);

      // Auto-translate if not in English and text is meaningful
      if (text.trim() && selectedLanguage !== "english" && text.length > 3) {
        setIsTranslating(true);
        try {
          const translatedText = await translateText(text, "english");
          if (translatedText !== text) {
            setTimeout(() => onChange(translatedText), 100);
          }
        } catch (error) {
          console.error("Translation failed:", error);
        } finally {
          setIsTranslating(false);
        }
      }
    };

    const inputClass = `w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      isTranslating ? "bg-yellow-50" : ""
    }`;

    if (multiline) {
      return (
        <div className="relative">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows="3"
            className={`${inputClass} resize-vertical min-h-[80px]`}
          />
          {isTranslating && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
        />
        {isTranslating && (
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
          </div>
        )}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>
        <p className="text-gray-600 mt-2">Basic details about yourself</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries({
          name: "Full Name *",
          email: "Email Address *",
          phone: "Phone Number",
          address: "Address",
          city: "City",
          state: "State",
          pincode: "PIN Code",
        }).map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            {inputMethod === "voice" ? (
              <div className="space-y-2">
                <VoiceInput
                  onTextReceived={(text) =>
                    handleInputChange("personal_info", field, text)
                  }
                  placeholder={`Say your ${label
                    .toLowerCase()
                    .replace(" *", "")}`}
                  currentValue={userData.personal_info[field]}
                />
                <TextInput
                  value={userData.personal_info[field]}
                  onChange={(value) =>
                    handleInputChange("personal_info", field, value)
                  }
                  placeholder={`Enter your ${label
                    .toLowerCase()
                    .replace(" *", "")}`}
                />
              </div>
            ) : (
              <TextInput
                value={userData.personal_info[field]}
                onChange={(value) =>
                  handleInputChange("personal_info", field, value)
                }
                placeholder={`Enter your ${label
                  .toLowerCase()
                  .replace(" *", "")}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500 mt-4">* Required fields</div>
    </div>
  );

  const renderCareerObjective = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="mx-auto w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Career Objective</h2>
        <p className="text-gray-600 mt-2">
          Describe your career goals and aspirations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Objective
        </label>
        {inputMethod === "voice" ? (
          <div className="space-y-2">
            <VoiceInput
              onTextReceived={(text) =>
                handleInputChange("objective", null, text)
              }
              placeholder="Speak your career objective"
              currentValue={userData.objective}
            />
            <TextInput
              value={userData.objective}
              onChange={(value) => handleInputChange("objective", null, value)}
              placeholder="Describe your career goals and what you want to achieve..."
              multiline={true}
            />
          </div>
        ) : (
          <TextInput
            value={userData.objective}
            onChange={(value) => handleInputChange("objective", null, value)}
            placeholder="Describe your career goals and what you want to achieve..."
            multiline={true}
          />
        )}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="mx-auto w-16 h-16 text-purple-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Education</h2>
        <p className="text-gray-600 mt-2">Your educational background</p>
      </div>

      <div className="space-y-6">
        {userData.education.map((edu, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Education {index + 1}</h3>
              {userData.education.length > 1 && (
                <button
                  onClick={() => removeArrayItem("education", index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove this education entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries({
                degree: "Degree/Qualification *",
                institution: "Institution Name *",
                year: "Year of Completion",
                percentage: "Percentage/CGPA",
              }).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <TextInput
                    value={edu[field] || ""}
                    onChange={(value) =>
                      handleInputChange("education", field, value, index)
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            addArrayItem("education", {
              degree: "",
              institution: "",
              year: "",
              percentage: "",
            })
          }
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Education
        </button>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="mx-auto w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Work Experience</h2>
        <p className="text-gray-600 mt-2">Your professional experience</p>
      </div>

      <div className="space-y-6">
        {userData.experience.map((exp, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
              {userData.experience.length > 1 && (
                <button
                  onClick={() => removeArrayItem("experience", index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove this experience entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries({
                company: "Company Name",
                position: "Job Position",
                duration: "Duration (e.g., 2020-2022)",
                description: "Job Description",
              }).map(([field, label]) => (
                <div
                  key={field}
                  className={field === "description" ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <TextInput
                    value={exp[field] || ""}
                    onChange={(value) =>
                      handleInputChange("experience", field, value, index)
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                    multiline={field === "description"}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            addArrayItem("experience", {
              company: "",
              position: "",
              duration: "",
              description: "",
            })
          }
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Experience
        </button>
      </div>
    </div>
  );

  const renderSkillsAndOthers = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Award className="mx-auto w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Skills & Additional Information
        </h2>
        <p className="text-gray-600 mt-2">
          Your skills and other relevant information
        </p>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          Skills (comma-separated)
        </label>
        <TextInput
          value={
            Array.isArray(userData.skills)
              ? userData.skills.join(", ")
              : userData.skills
          }
          onChange={(value) => handleInputChange("skills", null, value)}
          placeholder="e.g., Python, JavaScript, Communication, Leadership"
        />
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Projects
          </label>
        </div>

        <div className="space-y-4">
          {userData.projects.map((project, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Project {index + 1}</h4>
                <button
                  onClick={() => removeArrayItem("projects", index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove this project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                {Object.entries({
                  name: "Project Name",
                  description: "Project Description",
                  technologies: "Technologies Used",
                  duration: "Duration",
                }).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <TextInput
                      value={project[field] || ""}
                      onChange={(value) =>
                        handleInputChange("projects", field, value, index)
                      }
                      placeholder={`Enter ${label.toLowerCase()}`}
                      multiline={field === "description"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              addArrayItem("projects", {
                name: "",
                description: "",
                technologies: "",
                duration: "",
              })
            }
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { key: "certifications", label: "Certifications", icon: Award },
          { key: "languages", label: "Languages Known", icon: Languages },
          { key: "hobbies", label: "Hobbies & Interests", icon: Heart },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </label>
            <TextInput
              value={
                Array.isArray(userData[key])
                  ? userData[key].join(", ")
                  : userData[key]
              }
              onChange={(value) => handleInputChange(key, null, value)}
              placeholder={`Enter ${label.toLowerCase()} (comma-separated)`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Eye className="mx-auto w-16 h-16 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Resume Preview</h2>
        <p className="text-gray-600 mt-2">
          Review your information before generating the resume
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm max-h-[calc(100vh-400px)] overflow-y-auto">
        {/* Personal Info Preview */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-center text-blue-600 mb-2">
            {userData.personal_info.name || "Your Name"}
          </h3>
          <div className="text-center text-gray-600 text-sm space-y-1">
            {userData.personal_info.email && (
              <div>📧 {userData.personal_info.email}</div>
            )}
            {userData.personal_info.phone && (
              <div>📱 {userData.personal_info.phone}</div>
            )}
            {(userData.personal_info.address ||
              userData.personal_info.city ||
              userData.personal_info.state) && (
              <div>
                🏠{" "}
                {[
                  userData.personal_info.address,
                  userData.personal_info.city,
                  userData.personal_info.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Career Objective */}
        {userData.objective && (
          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">
              Career Objective
            </h4>
            <p className="text-sm text-gray-700">{userData.objective}</p>
          </div>
        )}

        {/* Education */}
        {userData.education.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">
              Education
            </h4>
            {userData.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{edu.degree}</span>
                  <span className="text-sm text-gray-600">{edu.year}</span>
                </div>
                <div className="text-sm text-gray-600">{edu.institution}</div>
                {edu.percentage && (
                  <div className="text-sm text-gray-600">
                    Score: {edu.percentage}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {userData.experience.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">
              Work Experience
            </h4>
            {userData.experience.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {exp.position} at {exp.company}
                  </span>
                  <span className="text-sm text-gray-600">{exp.duration}</span>
                </div>
                {exp.description && (
                  <div className="text-sm text-gray-700 mt-1">
                    • {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {userData.skills.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">
              Skills
            </h4>
            <p className="text-sm text-gray-700">
              {Array.isArray(userData.skills)
                ? userData.skills.join(", ")
                : userData.skills}
            </p>
          </div>
        )}

        {/* Projects */}
        {userData.projects.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">
              Projects
            </h4>
            {userData.projects.map((project, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-gray-600">
                    {project.duration}
                  </span>
                </div>
                {project.description && (
                  <div className="text-sm text-gray-700">
                    • {project.description}
                  </div>
                )}
                {project.technologies && (
                  <div className="text-sm text-gray-600 italic">
                    Technologies: {project.technologies}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output Language Selection */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center">
          <Globe className="w-4 h-4 mr-2" />
          Resume Output Language
        </h4>
        <select
          value={outputLanguage}
          onChange={(e) => setOutputLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          Your resume will be generated in the selected language using automatic
          translation.
        </p>
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">Step {currentStep} of 6</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / 6) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 2:
        return userData.personal_info.name && userData.personal_info.email;
      case 3:
        return true; // Career objective is optional
      case 4:
        return true; // Education can be empty for some cases
      case 5:
        return true; // Experience can be empty for fresh graduates
      case 6:
        return true; // Skills section is optional but recommended
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      setError("");
    } else {
      setError("Please fill in the required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const clearError = () => {
    if (error) {
      setTimeout(() => setError(""), 5000);
    }
  };

  useEffect(() => {
    clearError();
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Multilingual Resume Builder
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Create professional resumes with voice and text input in multiple
            languages
          </p>
        </div>

        {/* Settings */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Getting Started
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Input Method
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "text",
                      label: "Text Input",
                      icon: FileText,
                      desc: "Type your information",
                    },
                    {
                      value: "voice",
                      label: "Voice Input",
                      icon: Mic,
                      desc: "Speak your information (requires microphone)",
                    },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <label
                      key={value}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="inputMethod"
                        value={value}
                        checked={inputMethod === value}
                        onChange={(e) => setInputMethod(e.target.value)}
                        className="mr-3 text-blue-500 focus:ring-blue-500"
                      />
                      <Icon className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-gray-500">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Input Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Select the language you'll use for input. Content will be
                  automatically translated to English for processing.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                Start Building Resume
                <Play className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentStep > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {renderProgressBar()}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {loading && (
              <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin flex-shrink-0" />
                <span>Processing...</span>
              </div>
            )}

            {currentStep === 2 && renderPersonalInfo()}
            {currentStep === 3 && renderCareerObjective()}
            {currentStep === 4 && renderEducation()}
            {currentStep === 5 && renderExperience()}
            {currentStep === 6 && renderSkillsAndOthers()}
            {currentStep === 7 && renderPreview()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              {currentStep > 2 ? (
                <button
                  onClick={prevStep}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex space-x-3">
                {currentStep < 7 ? (
                  <button
                    onClick={nextStep}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={generateResume}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isMobile ? "Generating..." : "Generating Resume..."}
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        {isMobile ? "Download" : "Generate & Download"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            Supports {supportedLanguages.length} languages with voice and text
            input
          </p>
          <p className="text-xs mt-2">
            Note: This is a demo version with mock backend functionality
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resume;
