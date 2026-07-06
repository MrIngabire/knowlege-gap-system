import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Recommendations from "./pages/Recommendations";
import Analytics from "./pages/Analytics";
import LecturerDashboard from "./pages/LecturerDashboard";
import AttemptHistory from "./pages/AttemptHistory";
import AttemptDetail from "./pages/AttemptDetail";
import NotFound from "./pages/NotFound";

// Lecturer management pages
import Courses from "./pages/lecturer/Courses";
import Questions from "./pages/lecturer/Questions";
import Resources from "./pages/lecturer/Resources";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Quiz />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Recommendations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttemptHistory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempts/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttemptDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Lecturer routes */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LecturerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/courses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Courses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/questions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Questions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/resources"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Resources />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}