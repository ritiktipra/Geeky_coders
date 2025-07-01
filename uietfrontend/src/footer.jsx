import React from "react";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-6 text-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
        
        {/* Left side: Links */}
        <div className="flex gap-4">
          <a
            href="https://uiet.puchd.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            UIET
          </a>
          <a
            href="https://puchd.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Panjab University
          </a>
        </div>

        {/* Center: Contact info */}
        <div className="text-center">
          📍 Chandigarh, India &nbsp;|&nbsp; 📧 contact@uietpuchd.ac.in
        </div>

        {/* Right side: Copyright */}
        <div>
          © {new Date().getFullYear()} UIET, Panjab University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
