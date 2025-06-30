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
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Register as</h2>
        <div className="flex justify-center mb-4">
          <button
            type="button"
            className={`px-4 py-2 mr-2 rounded ${role === "student" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setRole("student")}
          >Student</button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${role === "teacher" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setRole("teacher")}
          >Teacher</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full border p-2 rounded"/>
          {fieldErrors.name && <p className="text-red-500 text-sm">{fieldErrors.name}</p>}

          <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded"/>
          {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}

          <input required name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded"/>
          {fieldErrors.phone && <p className="text-red-500 text-sm">{fieldErrors.phone}</p>}

          <input required type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border p-2 rounded"/>
          {fieldErrors.dob && <p className="text-red-500 text-sm">{fieldErrors.dob}</p>}

          <select required name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          {fieldErrors.gender && <p className="text-red-500 text-sm">{fieldErrors.gender}</p>}

          <textarea required name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full border p-2 rounded"></textarea>
          {fieldErrors.address && <p className="text-red-500 text-sm">{fieldErrors.address}</p>}

          {role === "student" && (
            <>
              <input required name="roll_no" value={form.roll_no} onChange={handleChange} placeholder="Roll Number" className="w-full border p-2 rounded"/>
              {fieldErrors.roll_no && <p className="text-red-500 text-sm">{fieldErrors.roll_no}</p>}

              <input required name="department" value={form.department} onChange={handleChange} placeholder="Department (CAPITAL)" className="w-full border p-2 rounded"/>
              {fieldErrors.department && <p className="text-red-500 text-sm">{fieldErrors.department}</p>}

              <input required name="course" value={form.course} onChange={handleChange} placeholder="Course (CAPITAL)" className="w-full border p-2 rounded"/>
              {fieldErrors.course && <p className="text-red-500 text-sm">{fieldErrors.course}</p>}

              <select required name="semester" value={form.semester} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">Select Semester</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i+1}>{i+1}</option>
                ))}
              </select>
              {fieldErrors.semester && <p className="text-red-500 text-sm">{fieldErrors.semester}</p>}

              <input required name="section" value={form.section} onChange={handleChange} placeholder="Section (CAPITAL)" className="w-full border p-2 rounded"/>
              {fieldErrors.section && <p className="text-red-500 text-sm">{fieldErrors.section}</p>}
            </>
          )}

          {role === "teacher" && (
            <>
              <input required name="employee_id" value={form.employee_id} onChange={handleChange} placeholder="Employee ID (CAPITAL)" className="w-full border p-2 rounded"/>
              {fieldErrors.employee_id && <p className="text-red-500 text-sm">{fieldErrors.employee_id}</p>}

              <select required name="subject" value={form.subject} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">Select Subject</option>
                <option>ACE</option>
                <option>EMT</option>
                <option>EMI</option>
                <option>DD</option>
                <option>VLSI</option>
                <option>Power Electronics</option>
              </select>
              {fieldErrors.subject && <p className="text-red-500 text-sm">{fieldErrors.subject}</p>}
            </>
          )}

          <button disabled={loading} type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
