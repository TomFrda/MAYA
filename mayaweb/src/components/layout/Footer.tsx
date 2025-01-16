import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm">
            © 2025 Maya. Tous droits réservés.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-600 hover:text-pink-500 text-sm transition-colors">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-pink-500 text-sm transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-pink-500 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;