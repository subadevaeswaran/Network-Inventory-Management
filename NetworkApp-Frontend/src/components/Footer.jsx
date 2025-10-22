// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="h-12 bg-white shadow-inner flex items-center justify-center px-6 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} network inventory management
      </p>
    </footer>
  );
};

export default Footer;