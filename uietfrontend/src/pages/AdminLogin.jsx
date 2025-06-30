import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  try {
    const res = await api.post("/admin/login", {
      user_id: adminId,   // fixed field name
      password: password,
    });
    const token = res.data.token;
    localStorage.setItem("token", token);
    localStorage.setItem("role", "admin");
    navigate("/admin/dashboard");
  } catch (err) {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : detail;
      setMessage(msg);
    } else {
      setMessage("Admin login failed.");
    }
  }
  setLoading(false);
};

  return (
    <div className="flex items-center justify-center py-10 bg-gradient-to-b from-purple-100 to-purple-200 min-h-screen">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            name="adminId"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="Admin ID"
            className="w-full border p-2 rounded"
          />
          <input
            required
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border p-2 rounded"
          />
          <button disabled={loading} type="submit" className="w-full bg-purple-500 text-white py-2 rounded">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && <p className="mt-3 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}
