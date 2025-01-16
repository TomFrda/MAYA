import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { token, userInfo, logout } = useContext(AuthContext);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              MAYA
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {token ? (
              <>
                <span className="text-gray-700">
                  Bonjour, {userInfo?.first_name}
                </span>
                <Link 
                  to="/swipe" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Swipe
                </Link>
                <Link 
                  to="/matches" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Matchs
                </Link>
                <Link 
                  to="/messages" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Messages
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-white transition-all bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hover:opacity-90"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-white transition-all bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hover:opacity-90"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;