import React from 'react';
import { Link } from 'react-router-dom'; // For navigation links

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Branding */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-green-400">Expense Tracker</h3>
            <p className="text-sm text-gray-400">Manage your finances with ease.</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-center">
            <Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-green-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-green-400 transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Expense Tracker. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;