import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dating App</h1>
        <nav>
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/login" className="mr-4">Login</Link>
          <Link to="/signup" className="mr-4">Sign Up</Link>
          <Link to="/swipe" className="mr-4">Swipe</Link>
          <Link to="/profile" className="mr-4">Profile</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;