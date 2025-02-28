import React, { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-green-600">Expense Tracker</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">
              Expenses
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">
              Reports
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">
              Settings
            </a>
          </div>

          {/* Hamburger Button (Mobile) */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <a
                href="#"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md"
              >
                Expenses
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md"
              >
                Reports
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-md"
              >
                Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;