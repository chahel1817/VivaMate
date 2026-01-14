import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./utils/protectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import Performance from "./pages/Performance";
import Feedback from "./pages/Feedback";
import InterviewSummary from "./pages/InterviewSummary";
import InterviewSelect from "./pages/InterviewSelect";
import InterviewConfig from "./pages/InterviewConfig";
import InterviewProcessing from "./pages/InterviewProcessing";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
