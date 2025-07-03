import React, { useEffect, useState } from "react";
import { markAttendance, getStudentAttendance, exportStudentAttendanceCSV } from "../services/api";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const SUBJECTS = ["EMT", "VLSI", "DSA", "CE", "DSP", "MICROPROCESSOR", "NETWORKS"];

export default function StudentDashboard() {
  const [otp, setOtp] = useState("");
  const [subject, setSubject] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpInfo, setOtpInfo] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [profile, setProfile] = useState(null);

  const roll_no = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!roll_no) {
      navigate("/login");
    } else {
      fetchProfile();
      loadAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll_no]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/student/profile/${roll_no}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    if (otp.length > 0) {
      checkOtp();
    } else {
      setOtpInfo(null);
      setOtpError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const checkOtp = async () => {
    try {
      const res = await api.get(`/student/check-otp/${otp}`);
      setOtpInfo(res.data);
      setOtpError("");
    } catch (err) {
      console.error(err);
      setOtpInfo(null);
      setOtpError("❌ Invalid OTP or expired");
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadAttendance = async (subjectFilter, dateFilter) => {
    try {
      let data = await getStudentAttendance(roll_no);
      if (subjectFilter) {
        data = data.filter(
          (a) => a.subject.toLowerCase() === subjectFilter.toLowerCase()
        );
      }
      if (dateFilter) {
        data = data.filter(
          (a) => new Date(a.marked_at).toDateString() === new Date(dateFilter).toDateString()
        );
      }
      setAttendanceList(data || []);
    } catch (err) {
      console.error("Failed to load attendance", err);
      setMessage("❌ Failed to load attendance.");
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!roll_no || !otp || !subject) {
      setMessage("❌ Please fill all fields before marking attendance.");
      return;
    }
    setLoading(true);
    try {
      await markAttendance(roll_no, subject, otp);
      setMessage("✅ Attendance marked successfully!");
      setOtp("");
      setSubject("");
      loadAttendance(filterSubject, filterDate);
    } catch (err) {
      console.error(err);
      let detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail = detail.map((d) => d.msg).join(", ");
      }
      setMessage(detail || "❌ Failed to mark attendance.");
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const blob = await exportStudentAttendanceCSV(roll_no);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${roll_no}_${new Date().toISOString()}.csv`);
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
    <div className="p-6 bg-gradient-to-b from-green-100 to-green-200 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {profile ? profile.full_name : 'Loading...'}
        </h2>
        <div className="text-gray-600 space-x-4 text-sm md:text-base">
          <span>🎓 Roll No: <b>{roll_no}</b></span>
          {profile?.department && <span>🏫 Department: <b>{profile.department}</b></span>}
          {profile?.semester && <span>📚 Semester: <b>{profile.semester}</b></span>}
          {profile?.section && <span>🔖 Section: <b>{profile.section}</b></span>}
        </div>
      </div>


      {/* Mark Attendance */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Mark Attendance using OTP</h2>
        <form onSubmit={handleMarkAttendance} className="flex flex-col md:flex-row gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="" disabled>Select Subject</option>
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="p-2 border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? "Marking..." : "Mark Attendance"}
          </button>
        </form>

        {otpInfo && (
          <div className="text-sm text-gray-700 mt-2">
            OTP is for subject: <b>{otpInfo.subject}</b><br/>
            Active from: {new Date(otpInfo.start_time).toLocaleString()}<br/>
            Until: {new Date(otpInfo.end_time).toLocaleString()}
          </div>
        )}
        {otpError && (
          <p className="text-red-600 mt-1">{otpError}</p>
        )}
        {message && (
          <p className={`mt-2 ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-3">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={() => loadAttendance(filterSubject, filterDate)}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setFilterSubject("");
            setFilterDate("");
            loadAttendance();
          }}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      {/* Attendance History */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Attendance History</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Subject</th>
                <th className="border px-2 py-1">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length > 0 ? (
                attendanceList.map((a, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{a.subject}</td>
                    <td className="border px-2 py-1">{new Date(a.marked_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center p-2">No attendance marked yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export Attendance CSV
      </button>
    </div>
  );
}
