// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  generateOtp,
  getAttendance,
  getGeneratedOtps,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LogOut,
  User,
  KeyRound,
  ShieldCheck,
  BookOpenText,
  CalendarCheck2,
  FileDown,
  Filter,
} from "lucide-react";
import Papa from "papaparse";



const SUBJECTS = ["EMT", "VLSI", "DSA", "CE", "DSP", "MICROPROCESSOR", "NETWORKS"];

export default function TeacherDashboard() {
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(5);
  const [otpList, setOtpList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [profile, setProfile] = useState(null);

  const employeeId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!employeeId) navigate("/login");
    else {
      loadOtps();
      fetchProfile();
      loadAttendance();
    }
  }, [employeeId, navigate]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 20000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/teacher/profile/${employeeId}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

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

      setOtpList((prev) =>
        [newOtp, ...prev]
          .filter((item) => new Date(item.end_time) > new Date())
          .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
      );

      const validTill = new Date(data.valid_till).getTime();
      const now = Date.now();
      const timeout = validTill - now;

      if (timeout > 0) {
        setTimeout(() => {
          setOtpList((prev) => prev.filter((item) => item.otp !== newOtp.otp));
        }, timeout);
      }

      setMessage(`✅ OTP Generated: ${data.otp} (valid till: ${new Date(data.valid_till).toLocaleString()})`);
    } catch (err) {
      console.error("Generate OTP error:", err);
      setMessage(err.response?.data?.detail || "❌ Failed to generate OTP");
    }
    setLoading(false);
  };

  const handleExport = () => {
    const filtered = attendanceList.filter((a) => {
      if (filterDate) {
        const date = new Date(a.marked_at).toISOString().split("T")[0];
        return date === filterDate;
      }
      if (filterMonth) {
        const month = new Date(a.marked_at).toISOString().slice(0, 7);
        return month === filterMonth;
      }
      return true;
    });

    if (filtered.length === 0) {
      setMessage("❌ No attendance records to export.");
      return;
    }

    const csv = Papa.unparse(
      filtered.map((a) => ({
        RollNo: a.roll_no,
        Subject: a.subject,
        MarkedAt: new Date(a.marked_at).toLocaleString(),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_${employeeId}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const SectionTitle = ({ icon: Icon, title }) => (
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
      <Icon className="w-5 h-5 text-blue-600" />
      {title}
    </h2>
  );

  
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Teacher Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <SectionTitle icon={User} title="Teacher Profile" />
          <p className="text-gray-600 text-xl uppercase">
            👤 <strong>{profile ? profile.full_name : "Loading..."}</strong>
          </p>
          <p className="text-gray-600 text-sm">
            🆔 Employee ID: <span className="font-medium">{employeeId}</span>
          </p>
        </div>

        
        {/* OTP Generator */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <SectionTitle icon={KeyRound} title="Generate OTP for Class" />
          <form onSubmit={handleGenerateOtp} className="flex flex-col md:flex-row md:items-center gap-4">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-2 border rounded-md w-full md:w-1/3"
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
              className="p-2 border rounded-md w-full md:w-1/4"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full md:w-fit"
            >
              {loading ? "Generating..." : "Generate OTP"}
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>

        {/* Active OTPs */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <SectionTitle icon={BookOpenText} title="Active OTPs" />
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-3 py-2 text-left">OTP</th>
                  <th className="border px-3 py-2 text-left">Subject</th>
                  <th className="border px-3 py-2 text-left">Valid Till</th>
                </tr>
              </thead>
              <tbody>
                {otpList.length > 0 ? (
                  otpList.map((otp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{otp.otp}</td>
                      <td className="border px-3 py-2">{otp.subject}</td>
                      <td className="border px-3 py-2">{new Date(otp.end_time).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-3 text-gray-500">No OTPs generated yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters + Export */}
        <div className="bg-white shadow-sm rounded-lg p-5 space-y-4">
          <SectionTitle icon={Filter} title="Filter & Export Attendance Records" />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1 text-gray-600">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 text-gray-600">Filter by Month</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setFilterDate(""); setFilterMonth(""); }}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white shadow-sm rounded-lg p-5">
          <SectionTitle icon={CalendarCheck2} title="Attendance Marked by Students" />
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-3 py-2 text-left">Roll No</th>
                  <th className="border px-3 py-2 text-left">Subject</th>
                  <th className="border px-3 py-2 text-left">Marked At</th>
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
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-3 py-2">{a.roll_no}</td>
                        <td className="border px-3 py-2">{a.subject}</td>
                        <td className="border px-3 py-2">{new Date(a.marked_at).toLocaleString()}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-3 text-gray-500">No attendance records yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
