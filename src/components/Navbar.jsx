import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/user/logout', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        navigate('/'); 
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white shadow-md z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-bold text-gray-100 hover:text-gray-300 transition-colors">
            Expense Tracker
          </Link>
        </div>
  
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
  
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
  
        {/* Hamburger Button (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
  
      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 border-t border-gray-800">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
              onClick={() => setIsOpen(false)} // Close menu on click
            >
              Dashboard
            </Link>
  
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  </nav>
  
  );
}

export default Navbar;