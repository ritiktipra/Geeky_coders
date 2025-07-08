import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    roll_no: "",
    department: "",
    course: "",
    semester: "",
    section: "",
    employee_id: "",
    subject: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-transform fields
    if (["department", "course", "section", "employee_id"].includes(name)) {
      value = value.toUpperCase();
    }
    if (name === "roll_no") {
      value = value.replace(/\D/, ""); // digits only
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors({});
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setFieldErrors({});

    try {
      if (role === "student") {
        await api.post("/register/student", {
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          roll_no: form.roll_no,
          department: form.department,
          course: form.course,
          semester: parseInt(form.semester),
          section: form.section,
        });
      } else {
        await api.post("/register/teacher", {
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          employee_id: form.employee_id,
          subject: form.subject,
        });
      }
      setMessage("✅ Registration successful! Wait for admin approval.");
      setForm({
        name:"", email:"", phone:"", dob:"", gender:"", address:"",
        roll_no:"", department:"", course:"", semester:"", section:"",
        employee_id:"", subject:""
      });
    } catch (err) {
      if (Array.isArray(err.response?.data?.detail)) {
        const newErrors = {};
        err.response.data.detail.forEach(error => {
          if (error.loc && error.loc.length >= 2) {
            const fieldName = error.loc[1];
            newErrors[fieldName] = error.msg;
          }
        });
        setFieldErrors(newErrors);
      } else {
        setMessage(err.response?.data?.detail || "❌ Error during registration.");
      }
    }
    setLoading(false);
  };

  return (
    
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
    <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">Register as</h2>
      <div className="flex justify-center mb-6 space-x-4">
        <button
          type="button"
          className={`px-5 py-2 rounded-full font-semibold transition ${
            role === "student"
              ? "bg-blue-900 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setRole("student")}
        >
          Student
        </button>
        <button
          type="button"
          className={`px-5 py-2 rounded-full font-semibold transition ${
            role === "teacher"
              ? "bg-blue-900 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setRole("teacher")}
        >
          Teacher
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* common fields */}
        {/* keep same mapping as earlier, just change input styles */}
        {[
          { label: "Name", name: "name", placeholder: "Full Name" },
          { label: "Email", name: "email", type: "email", placeholder: "Email" },
          { label: "Contact No", name: "phone", placeholder: "Phone" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Gender", name: "gender", type: "select", options: ["Male", "Female"] },
          { label: "Address", name: "address", type: "textarea", placeholder: "Address" },
        ].map(({ label, name, type = "text", placeholder, options }) => (
          <div key={name}>
            <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
            {type === "select" ? (
              <select
                required
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select {label}</option>
                {options.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            ) : type === "textarea" ? (
              <textarea
                required
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition"
              />
            ) : (
              <input
                required
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition"
              />
            )}
            {fieldErrors[name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>}
          </div>
        ))}

        {/* student fields */}
        {role === "student" && (
          <>
            <label className="block text-gray-700 text-sm font-medium mb-1">Roll No</label>
            <input required name="roll_no" value={form.roll_no} onChange={handleChange}
              placeholder="Roll Number"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition" />
            {fieldErrors.roll_no && <p className="text-red-500 text-xs mt-1">{fieldErrors.roll_no}</p>}

            <label className="block text-gray-700 text-sm font-medium mb-1">Department</label>
            <input required name="department" value={form.department} onChange={handleChange}
              placeholder="Department"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition" />
            {fieldErrors.department && <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>}

            <label className="block text-gray-700 text-sm font-medium mb-1">Branch</label>
            <input required name="course" value={form.course} onChange={handleChange}
              placeholder="Branch"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition" />
            {fieldErrors.course && <p className="text-red-500 text-xs mt-1">{fieldErrors.course}</p>}

            <label className="block text-gray-700 text-sm font-medium mb-1">Semester</label>
            <select required name="semester" value={form.semester} onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition">
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, i) => <option key={i+1}>{i+1}</option>)}
            </select>
            {fieldErrors.semester && <p className="text-red-500 text-xs mt-1">{fieldErrors.semester}</p>}

            <label className="block text-gray-700 text-sm font-medium mb-1">Section</label>
            <select required name="section" value={form.section} onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition">
              <option value="" disabled>Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
            {fieldErrors.section && <p className="text-red-500 text-xs mt-1">{fieldErrors.section}</p>}
          </>
        )}

        {/* teacher fields */}
        {role === "teacher" && (
          <>
            <label className="block text-gray-700 text-sm font-medium mb-1">Employee ID</label>
            <input required name="employee_id" value={form.employee_id} onChange={handleChange}
              placeholder="Employee ID"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition" />
            {fieldErrors.employee_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.employee_id}</p>}

            <label className="block text-gray-700 text-sm font-medium mb-1">Subject</label>
            <select required name="subject" value={form.subject} onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 transition">
              <option value="">Select Subject</option>
              <option>ACE</option>
              <option>EMT</option>
              <option>EMI</option>
              <option>DD</option>
              <option>VLSI</option>
              <option>Power Electronics</option>
            </select>
            {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject}</p>}
          </>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-900 text-white font-semibold py-2 rounded-full shadow hover:bg-blue-800 transition"
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-blue-700 font-medium">{message}</p>}
    </div>
  </div>
);

}
