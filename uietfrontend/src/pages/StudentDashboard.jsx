import React, { useEffect, useState } from "react";
import { markAttendance, getStudentAttendance, exportStudentAttendanceCSV } from "../services/api";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getFingerprint } from "../services/getFingerprint"

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
  const [otpPasteMessage, setOtpPasteMessage] = useState("");

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

  // const handleMarkAttendance = async (e) => {
  //   e.preventDefault();
  //   if (!roll_no || !otp || !subject) {
  //     setMessage("❌ Please fill all fields before marking attendance.");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const visitorId = await getFingerprint(); // get device fingerprint
  //     await markAttendance(roll_no, subject, otp, visitorId);
  //     setMessage("✅ Attendance marked successfully!");
  //     setOtp("");
  //     setSubject("");
  //     loadAttendance(filterSubject, filterDate);
  //   } catch (err) {
  //     console.error(err);
  //     let detail = err.response?.data?.detail;
  //     if (Array.isArray(detail)) {
  //       detail = detail.map((d) => d.msg).join(", ");
  //     }
  //     setMessage(detail || "❌ Failed to mark attendance.");
  //   }
  //   setLoading(false);
  // };

  const handleMarkAttendance = async (e) => {
  e.preventDefault();
  if (!roll_no || !otp || !subject) {
    setMessage("❌ Please fill all fields before marking attendance.");
    return;
  }
  setLoading(true);
  try {
    const visitorId = await getFingerprint();

    // Get location
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
    );
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    await markAttendance(roll_no, subject, otp, visitorId, lat, lng);
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

    const handleExport = () => {
  if (attendanceList.length === 0) {
    setMessage("⚠️ No attendance data to export.");
    return;
  }

  if (!profile) {
    setMessage("❌ Profile not loaded yet.");
    return;
  }

  const metaRows = [
    [`Name:,${profile.full_name}`],
    [`Roll No:,${profile.roll_no}`],
    [`Department:,${profile.department || ''}`],
    [`Semester:,${profile.semester || ''}`],
    [`Section:,${profile.section || ''}`],
    [], // empty row before table
  ];

  const headers = ["Subject", "Marked At", "Time"];
  const dataRows = attendanceList.map((a) => [
    a.subject,
    new Date(a.marked_at).toLocaleString(),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [...metaRows, headers, ...dataRows].map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute(
    "download",
    `attendance_${profile.roll_no}_${new Date().toISOString()}.csv`
  );
  link.href = encodedUri;
  document.body.appendChild(link);
  link.click();
  link.remove();
};


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 md:p-8">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">🎓 Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
        >
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome, <span className="text-green-700">{profile ? profile.full_name : 'Loading...'}</span>
        </h2>
        <div className="text-gray-600 flex flex-wrap gap-4 mt-2 text-sm md:text-base">
          <span>🆔 <b>Roll No:</b> {roll_no}</span>
          {profile?.department && <span>🏫 <b>Department:</b> {profile.department}</span>}
          {profile?.semester && <span>📚 <b>Semester:</b> {profile.semester}</span>}
          {profile?.section && <span>🔖 <b>Section:</b> {profile.section}</span>}
        </div>
      </div>

      {/* Mark Attendance */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">✅ Mark Attendance using OTP</h2>
        <form onSubmit={handleMarkAttendance} className="flex flex-col md:flex-row gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400"
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
            onPaste={(e) => {
              e.preventDefault();
              setOtpPasteMessage("⚠️ Pasting is disabled. Type the OTP like a real human. 🕶️💻");
              setTimeout(() => setOtpPasteMessage(""), 5000);
            }}
            placeholder="Enter OTP"
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            {loading ? "Marking..." : "Mark Attendance"}
          </button>
        </form>

        {otpPasteMessage && <p className="text-yellow-700 text-sm">{otpPasteMessage}</p>}

        {otpInfo && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-gray-700">
            <p>OTP is for subject: <b>{otpInfo.subject}</b></p>
            <p>Active from: {new Date(otpInfo.start_time).toLocaleString()}</p>
            <p>Until: {new Date(otpInfo.end_time).toLocaleString()}</p>
          </div>
        )}
        {otpError && <p className="text-red-600">{otpError}</p>}
        {message && (
          <p className={`text-sm ${message.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400"
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
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={() => loadAttendance(filterSubject, filterDate)}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded shadow"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setFilterSubject("");
            setFilterDate("");
            loadAttendance();
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded shadow"
        >
          Reset
        </button>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">📅 Attendance History</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border px-3 py-2">Subject</th>
                <th className="border px-3 py-2">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length > 0 ? (
                attendanceList.map((a, idx) => (
                  <tr key={idx} className="hover:bg-green-50">
                    <td className="border px-3 py-2">{a.subject}</td>
                    <td className="border px-3 py-2">{new Date(a.marked_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center p-3 text-gray-500">No attendance marked yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          📤 Export Attendance CSV
        </button>
      </div>
    </div>
  </div>
);
}
