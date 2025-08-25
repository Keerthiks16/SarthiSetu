# NFC: The Codefather - AI-Powered Career and Recruitment Platform

**NFC: The Codefather** is a comprehensive, multi-user platform designed to bridge the gap between job seekers, recruiters, and mentors. Leveraging the power of AI, this application provides a rich set of tools to facilitate career growth, streamline the hiring process, and foster mentorship connections. The platform features distinct, role-based dashboards for Employees, Recruiters, and Mentors, ensuring a tailored experience for each user group.

-----

## ✨ Key Features

This platform is packed with features designed for a modern workforce:

  * **Role-Based Dashboards**: Separate, customized interfaces and functionalities for Job Seekers (Employees), Recruiters, and Mentors.
  * **Secure Authentication**: Robust user authentication system with email/password signup and login. Includes an experimental **Face Authentication** feature using computer vision.

### 🧑‍💼 For Job Seekers (Employees)

  * **AI-Powered Career Guidance**:
      * **Career Recommender**: Get personalized job suggestions based on your skills and interests.
      * **Interest Profiler**: Discover your career inclinations and get a tailored learning path.
  * **Advanced Resume Tools**:
      * **Multilingual Resume Builder**: Create professional resumes in multiple languages using text or **voice input**.
      * **Resume Summarizer**: Upload your PDF resume to get an instant, AI-generated summary.
  * **Job Hub**:
      * Browse, search, and filter a comprehensive list of job openings.
      * Apply for jobs and track the status of all your applications in one place.
  * **Skill Enhancement**:
      * **Aptitude & Skill Quizzes**: Test your knowledge and identify areas for improvement.
      * **Course Explorer**: Find relevant YouTube courses and playlists to learn new skills.
  * **Mentorship & Support**:
      * **Mentor Connect**: Engage in real-time video sessions with experienced mentors for guidance.
      * **Sahayoga Support Helper**: Get AI-driven assistance for real-world challenges like childcare, transport, and digital access.

### 🏢 For Recruiters

  * **Effortless Job Management**:
      * Post new job openings with detailed descriptions, requirements, and benefits.
      * View, manage, and delete your active job postings from a centralized dashboard.
  * **Streamlined Application Tracking**:
      * Access a dedicated dashboard for each job posting to view all applicants.
      * Update application statuses (Pending, Reviewed, Shortlisted, Rejected) to keep track of the hiring pipeline.

### 👨‍🏫 For Mentors

  * **Mentorship Dashboard**: A dedicated space to manage mentorship availability and upcoming sessions with job seekers.

-----

## 🚀 Tech Stack

The platform is built with a modern and powerful technology stack, integrating a web application with several backend microservices and AI capabilities.

  * **Frontend**:

      * **Framework**: **React.js** with Vite
      * **Styling**: **Tailwind CSS**
      * **State Management**: **Zustand**
      * **HTTP Client**: Axios

  * **Backend**:

      * **Framework**: **Node.js** with **Express.js**
      * **Database**: **MongoDB** with Mongoose ODM
      * **Authentication**: JSON Web Tokens (JWT) & bcrypt.js

  * **AI & Python Services**:

      * **AI Models**: **Google Gemini API** for summarization, translation, and content generation.
      * **Backend**: **Python** with **Flask** for serving AI models.
      * **Face Recognition**: OpenCV & DeepFace
      * **Voice-to-Text**: SpeechRecognition library
      * **PDF Generation**: ReportLab

  * **Real-time Communication**:

      * **Video Conferencing**: ZegoCloud UIKit

-----

## 📂 Project Structure

The repository is organized into a monorepo structure containing the main frontend, backend server, and various Python-based services.

```
/
├── face_auth/            # Python scripts for face authentication
├── frontend/             # React.js frontend application
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components (including Flask microservices)
│       ├── context/      # React context providers
│       ├── pages/        # Main pages for different user roles
│       └── store/        # Zustand state management stores
├── server/               # Node.js/Express.js backend server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/           # Mongoose schemas
│   └── routes/
└── models/               # Standalone Python scripts (e.g., resume builder)
```

-----

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js & npm
  * Python & pip
  * MongoDB instance

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/keerthiks16/nfc4_the_codefather.git
    ```
2.  **Setup Frontend**
    ```sh
    cd frontend
    npm install
    npm run dev
    ```
3.  **Setup Backend**
    ```sh
    cd ../server
    npm install
    # Create a .env file and add your MONGO_URI and JWT_SECRET
    npm run start
    ```
4.  **Setup Python Services**
      * Each Python directory (`face_auth`, `frontend/src/components`, `models`) has its own dependencies. You will need to install them using `pip`.
      * For example, for the resume summarizer:
        ```sh
        cd frontend/src/components
        pip install -r requirements.txt # (Assuming a requirements file exists)
        python app.py
        ```
