import React from "react";
import { Mail, MapPin, Landmark, Copyright } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        
        {/* Left: Links with icon */}
        <div className="flex items-center gap-4">
          <Landmark size={18} className="text-yellow-400" />
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

        {/* Center: Contact */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-yellow-400" />
            <span>Chandigarh, India</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail size={16} className="text-yellow-400" />
            <a href="mailto:contact@uietpuchd.ac.in" className="hover:underline">
              contact@uietpuchd.ac.in
            </a>
          </div>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center gap-1">
          <Copyright size={16} className="text-yellow-400" />
          <span>{new Date().getFullYear()} UIET, Panjab University. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
