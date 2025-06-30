import axios from "axios";

// create an axios instance
const api = axios.create({
  // baseURL: "http://127.0.0.1:8000", 
  baseURL: "https://uietbackend.onrender.com",
  timeout: 5000,
});

// Add a request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const markAttendance = (roll_no, subject, otp) =>
  {api.post("/student/markAttendance", {
    roll_no,
    subject,
    otp
  });
console.log("inside", subject);};


export const getStudentAttendance = async (rollNo) => {
  const res = await api.get(`/student/view-attendance/${rollNo}`);
  return res.data;
};

export const exportStudentAttendanceCSV = async (rollNo) => {
  const res = await api.get(`/student/export-attendance/${rollNo}`, {
    responseType: "blob",
  });
  return res.data;
};

export const generateOtp = async (employeeId, subject, duration) => {
  const res = await api.post("/teacher/generate-otp", {
    employee_id: employeeId,
    subject,
    duration_minutes: duration,
  });
  return res.data;
};


export const getAttendance = async (employeeId) => {
  const res = await api.get(`/teacher/view-attendance/${employeeId}`);
  return res.data;
};

export const exportAttendanceCSV = async (employeeId) => {
  const res = await api.get(`/teacher/export-attendance/${employeeId}`, {
    responseType: "blob",
  });
  return res.data;
};

export const getGeneratedOtps = async (employeeId) => {
  const res = await api.get(`/teacher/view-otps/${employeeId}`);
  return res.data;
};

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized → optional: redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/admin-login";
    }
    return Promise.reject(error);
  }
);


export default api;
