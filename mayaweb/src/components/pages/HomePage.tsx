import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-purple-500">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-6 text-5xl font-bold text-white">Maya</h1>
          <p className="mb-8 text-xl text-white opacity-90">
            Découvrez des personnes qui vous correspondent
          </p>
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="block w-full px-6 py-3 text-lg font-semibold text-pink-500 transition-all bg-white rounded-full hover:bg-gray-100"
            >
              Se connecter
            </Link>
            <Link 
              to="/signup" 
              className="block w-full px-6 py-3 text-lg font-semibold text-white transition-all border-2 border-white rounded-full hover:bg-white/10"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;