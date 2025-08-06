// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import LoadingSpinner from "./components/LoadingSpinner";
import Courses from "./pages/Courses";
import EmpHome from "./pages/EmployeePage/EmpHome";
import RecHome from "./pages/RectruiterPage/RecHome";
import MentorHome from "./pages/MentorPage/MentorHome";
import PostJobs from "./pages/RectruiterPage/PostJobs";
import MyPosting from "./pages/RectruiterPage/MyPostings";
import AllJobs from "./pages/EmployeePage/AllJobs";
import JobDetails from "./pages/EmployeePage/JobDetails";
import ApplicationsApplied from "./pages/EmployeePage/ApplicationsApplied";
import Quiz from "./pages/EmployeePage/Quiz";
import AppWrapper from "./pages/EmployeePage/MultiLingual";
import InterestProfiler from "./pages/EmployeePage/InterestProfiler";
import MentorConnect from "./pages/EmployeePage/MentorConnect";
import GoogleTranslate from "./GoogleTranslate";
import Aptitude from "./pages/EmployeePage/Aptitude";
import JobApplications from "./pages/RectruiterPage/JobApplication";
import ResumeSummarizer from "./components/OCR";
import CareerRec from "./components/CareerRec";
import Resume from "./components/Resume";
import SahayogaSupportHelper from "./pages/EmployeePage/HelperGuider";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Auth Route Component (redirect to home if already logged in)
const AuthRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emp-home"
            element={
              <ProtectedRoute>
                <EmpHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all"
            element={
              <ProtectedRoute>
                <AllJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-applications"
            element={
              <ProtectedRoute>
                <ApplicationsApplied />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interestprofiler"
            element={
              <ProtectedRoute>
                <InterestProfiler />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorconnect"
            element={
              <ProtectedRoute>
                <MentorConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aptitude"
            element={
              <ProtectedRoute>
                <Aptitude />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rec-home"
            element={
              <ProtectedRoute>
                <RecHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/postjob"
            element={
              <ProtectedRoute>
                <PostJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypostings"
            element={
              <ProtectedRoute>
                <MyPosting />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/my-jobs/:jobId/applicants`}
            element={
              <ProtectedRoute>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/local-guider`}
            element={
              <ProtectedRoute>
                <SahayogaSupportHelper />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/ocr`}
            element={
              <ProtectedRoute>
                <ResumeSummarizer />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/careerrec`}
            element={
              <ProtectedRoute>
                <CareerRec />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/resume`}
            element={
              <ProtectedRoute>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-home"
            element={
              <ProtectedRoute>
                <MentorHome />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <SignUp />
              </AuthRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
