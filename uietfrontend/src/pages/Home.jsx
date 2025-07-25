import { Link } from "react-router-dom";
import Footer from "/src/footer";
import { CheckCircle } from "lucide-react"; // Optional icon

export default function Home() {
  return (
    
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300">
      
      {/* Hero Heading */}
      <header className="text-center mt-16 mb-8 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 drop-shadow-xl">
          <span className="text-green-700">Attendance</span> Management
        </h1>
        <p className="mt-3 text-gray-600 text-lg">Simple • Secure • Smart</p>
      </header>

      {/* Center Box */}
      <main className="flex-grow flex justify-center items-center">
        <div className="bg-white/40 backdrop-blur-md shadow-xl rounded-3xl p-10 flex flex-col items-center space-y-6 
          transform hover:-translate-y-1 transition duration-500 ease-in-out animate-fade-in">
          
          {/* Optional icon */}
          <CheckCircle size={40} className="text-green-700 mb-2" />

          <Link
            to="/register"
            className="w-52 text-center bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 
              text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg 
              hover:scale-105 transition-transform duration-300"
          >
            Register
          </Link>

          <Link
            to="/login"
            className="w-52 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 
              text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg 
              hover:scale-105 transition-transform duration-300"
          >
            Student / Teacher Login
          </Link>

          <Link
            to="/admin/login"
            className="w-52 text-center bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 
              text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg 
              hover:scale-105 transition-transform duration-300"
          >
            Admin Login
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
