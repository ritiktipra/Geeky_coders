// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  generateOtp,
  getAttendance,
  exportAttendanceCSV,
  getGeneratedOtps,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const SUBJECTS = ["EMT", "VLSI", "DSA", "CE", "DSP", "MICROPROCESSOR", "NETWORKS"];

export default function TeacherDashboard() {
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(5);
  const [otpList, setOtpList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const employeeId = localStorage.getItem("userId"); // stored at login
  const name = localStorage.getItem("name"); // stored at login
  const navigate = useNavigate();

  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    if (!employeeId) {
      navigate("/login");
    } else {
      loadOtps();
      loadAttendance();
    }
  }, [employeeId, navigate]);

  // Clear message after few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 20000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadOtps = async () => {
    try {
      const data = await getGeneratedOtps(employeeId);
      setOtpList(data);
    } catch (err) {
      console.error("Failed to load OTPs", err);
    }
  };

  const loadAttendance = async () => {
    try {
      const data = await getAttendance(employeeId);
      setAttendanceList(data);
    } catch (err) {
      console.error("Failed to load attendance", err);
    }
  };

  const handleGenerateOtp = async (e) => {
  e.preventDefault();
  if (!subject) {
    setMessage("❌ Please select a subject");
    return;
  }
  setLoading(true);
  try {
    const data = await generateOtp(employeeId, subject, duration);

    const newOtp = {
      otp: data.otp,
      subject: data.subject,
      end_time: data.valid_till,
    };

    setOtpList(prev =>
      [newOtp, ...prev]
        .filter(item => new Date(item.end_time) > new Date()) // remove expired ones
        .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
    );

    // Optional: auto-remove this OTP exactly after it expires
    const validTill = new Date(data.valid_till).getTime();
    const now = Date.now();
    const timeout = validTill - now;

    if (timeout > 0) {
      setTimeout(() => {
        setOtpList(prev =>
          prev.filter(item => item.otp !== newOtp.otp)
        );
      }, timeout);
    }

    setMessage(`✅ OTP Generated: ${data.otp} (valid till: ${new Date(data.valid_till).toLocaleString()})`);

    // Optionally, refresh from backend once to sync
    // await loadOtps();

  } catch (err) {
    console.error("Generate OTP error:", err);
    setMessage(err.response?.data?.detail || "❌ Failed to generate OTP");
  }
  setLoading(false);
};


  const handleExport = async () => {
    try {
      const blob = await exportAttendanceCSV(employeeId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${employeeId}_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export attendance", err);
      setMessage("❌ Error exporting attendance.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6 bg-gradient-to-b from-blue-100 to-blue-200 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Welcome {name} : {employeeId}</h2>

      {/* Generate OTP */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Generate OTP for Class</h2>
        <form onSubmit={handleGenerateOtp} className="flex flex-col md:flex-row gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Subject</option>
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Validity (minutes)"
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Generating..." : "Generate OTP"}
          </button>
        </form>
        {message && (
          <p className={`mt-2 ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Generated OTPs */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Generated OTPs</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">OTP</th>
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Valid Till</th>
              </tr>
            </thead>
            <tbody>
              {otpList.length > 0 ? (
                otpList.map((otp, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{otp.otp}</td>
                    <td className="border px-2 py-1">{otp.subject}</td>
                    <td className="border px-2 py-1">{new Date(otp.end_time).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-2">No OTPs generated yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-3">
      <div>
        <label className="block text-sm mb-1">Filter by Date</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Filter by Month</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={() => { setFilterDate(""); setFilterMonth(""); }}
          className="bg-gray-300 text-black px-3 py-2 rounded hover:bg-gray-400"
        >
          Clear Filters
        </button>
      </div>
    </div>

      {/* Attendance History */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Attendance Marked by Students</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Student Roll No</th>
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length > 0 ? (
              attendanceList
                .filter((a) => {
                  if (filterDate) {
                    const date = new Date(a.marked_at).toISOString().split("T")[0];
                    return date === filterDate;
                  }
                  if (filterMonth) {
                    const month = new Date(a.marked_at).toISOString().slice(0, 7);
                    return month === filterMonth;
                  }
                  return true;
                })
                .map((a, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{a.roll_no}</td>
                    <td className="border px-2 py-1">{a.subject}</td>
                    <td className="border px-2 py-1">{new Date(a.marked_at).toLocaleString()}</td>
                  </tr>
                ))
            ) : (

                <tr>
                  <td colSpan="3" className="text-center p-2">No attendance marked yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Export Attendance CSV
      </button>
    </div>
  );
}
