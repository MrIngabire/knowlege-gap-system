import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      password: "",
      role: "student",
    });

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

      await api.post(
        "/users/register/",
        formData
      );

      navigate("/");

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div className="bg-white p-8 rounded-xl shadow w-96">

      <h1 className="text-3xl font-bold mb-6">
        Register
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
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

        <select
          name="role"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        >
          <option value="student">
            Student
          </option>

          <option value="lecturer">
            Lecturer
          </option>

        </select>

        <button
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          Register
        </button>

      </form>

    </div>
  );
}