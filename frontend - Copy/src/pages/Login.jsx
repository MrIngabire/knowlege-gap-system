import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await api.post(
        "/token/",
        formData
      );

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      navigate("/dashboard");

    } catch {

      setError(
        "Invalid username or password"
      );
    }
  };

  return (

    <div className="bg-white p-8 rounded-xl shadow w-96">

      <h1 className="text-3xl font-bold mb-6">
        Login
      </h1>

      {error && (
        <p className="text-red-500 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <button
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Login
        </button>

      </form>

      <p className="mt-4 text-center">

        No account?

        <Link
          className="text-blue-600 ml-2"
          to="/register"
        >
          Register
        </Link>

      </p>

    </div>
  );
}