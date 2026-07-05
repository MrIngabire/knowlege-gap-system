import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Recommendations from "./pages/Recommendations";
import Analytics from "./pages/Analytics";
import LecturerDashboard from "./pages/LecturerDashboard";
import NotFound from "./pages/NotFound";

import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}