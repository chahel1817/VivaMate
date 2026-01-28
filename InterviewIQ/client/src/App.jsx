import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { ThemeProvider } from "./context/themeContext";
import ProtectedRoute from "./utils/protectedRoute";
import Layout from "./components/Layout";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";

// Lazy Load Pages for Performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Interview = lazy(() => import("./pages/Interview"));
const Result = lazy(() => import("./pages/Result"));
const Performance = lazy(() => import("./pages/Performance"));
const Feedback = lazy(() => import("./pages/Feedback"));
const InterviewSummary = lazy(() => import("./pages/InterviewSummary"));
const InterviewSelect = lazy(() => import("./pages/InterviewSelect"));
const InterviewConfig = lazy(() => import("./pages/InterviewConfig"));
const InterviewProcessing = lazy(() => import("./pages/InterviewProcessing"));
const Profile = lazy(() => import("./pages/Profile"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Forum = lazy(() => import("./pages/Forum"));
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const ChallengeHistory = lazy(() => import("./pages/ChallengeHistory"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />

                {/* PROTECTED ROUTES */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route path="/interview-processing" element={<InterviewProcessing />} />

                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <Interview />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/interview-summary"
                  element={
                    <ProtectedRoute>
                      <InterviewSummary />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/interview/select"
                  element={
                    <ProtectedRoute>
                      <InterviewSelect />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/interview/config"
                  element={
                    <ProtectedRoute>
                      <InterviewConfig />
                    </ProtectedRoute>
                  }
                />


                <Route
                  path="/result"
                  element={
                    <ProtectedRoute>
                      <Result />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/performance"
                  element={
                    <ProtectedRoute>
                      <Performance />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute>
                      <Feedback />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/forum"
                  element={
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/daily-challenge"
                  element={
                    <ProtectedRoute>
                      <DailyChallenge />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <ChallengeHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <Bookmarks />
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
