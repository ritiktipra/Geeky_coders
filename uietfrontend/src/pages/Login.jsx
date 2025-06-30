import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = role === "student" ? "/login/student" : "/login/teacher";
      const payload = role === "student"
        ? { roll_no: userId.trim().toUpperCase(), dob }
        : { employee_id: userId.trim().toUpperCase(), dob };

      const res = await api.post(url, payload);

      // Save data to localStorage
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId.trim().toUpperCase());

      // Redirect to dashboard
      if (role === "student") {
        navigate("/student");
      } else {
        navigate("/teacher");
      }
    } catch (err) {
      console.error("Login error:", err);
      let detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail = detail.map(d => d.msg).join(", ");
      }
      setMessage(detail || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-10 bg-gradient-to-b from-blue-100 to-blue-200 min-h-screen">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Role toggle */}
        <div className="flex justify-center mb-4">
          {["student", "teacher"].map(r => (
            <button
              key={r}
              className={`px-4 py-2 mx-1 rounded ${role === r ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setRole(r)}
              type="button"
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder={role === "student" ? "Roll Number" : "Employee ID"}
            className="w-full border p-2 rounded"
          />
          <input
            required
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-center text-sm text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
