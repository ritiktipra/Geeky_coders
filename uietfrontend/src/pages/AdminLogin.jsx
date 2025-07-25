import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { User, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/admin/login", {
        user_id: adminId,
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-blue-400 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mb-2" />
          <h2 className="text-3xl font-semibold text-gray-800">Admin Login</h2>
          <p className="text-gray-500 text-sm mt-1">Login to access admin panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input
              required
              name="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Admin ID"
              className="w-full outline-none text-gray-700 bg-transparent"
            />
          </div>
          <div className="flex items-center border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full outline-none text-gray-700 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition duration-200 shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
