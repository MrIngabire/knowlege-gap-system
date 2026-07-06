import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/token/", formData);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      await loadUser();
      const profileRes = await api.get("/users/profile/");
      const user = profileRes.data;
      if (user.role === "lecturer") {
        navigate("/lecturer");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Left Side - Branding Section */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 flex flex-col justify-center text-white">
          <div className="mb-6">
            <h1 className="text-2xl font-bold leading-tight">
              KNOWLEDGE GAP
              <span className="block text-xl font-light text-indigo-200">
                SYSTEM
              </span>
            </h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Identify.</h2>
              <h2 className="text-2xl font-bold text-indigo-200">Bridge.</h2>
              <h2 className="text-2xl font-bold">Grow.</h2>
            </div>
            
            <p className="text-indigo-100 text-sm leading-relaxed">
              The Knowledge Gap System helps you identify learning gaps, personalize learning, and achieve mastery.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-3/5 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Login to access your Knowledge Gap System</p>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400 text-sm" />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 text-sm" />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  Login
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}