import { Link } from "react-router-dom";
import Footer from '/src/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 to-green-200">
      {/* Heading */}
      <header className="text-center mt-12 mb-6">
        <h1 className="text-4xl font-bold">Attendance Management</h1>
      </header>

      {/* Box with buttons */}
      <main className="flex-grow flex justify-center items-center">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-4">
          <Link to="/register" className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900">
            Register
          </Link>
          <Link to="/login" className="bg-blue-400 text-white px-6 py-2 rounded hover:bg-blue-500">
            Student/Teacher Login
          </Link>
          <Link to="/admin/login" className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800">
            Admin Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
