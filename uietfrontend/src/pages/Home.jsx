import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-6">Attendance Management</h1>
      <div className="space-x-4">
        <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded">Register</Link>
        <Link to="/login" className="bg-green-500 text-white px-4 py-2 rounded">Student/Teacher Login</Link>
        <Link to="/admin/login" className="bg-gray-700 text-white px-4 py-2 rounded">Admin Login</Link>
      </div>
    </div>
  );
}
