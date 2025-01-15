import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/apiService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useContext(AuthContext);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const response = await login(
              email, 
              password,
              position.coords.latitude,
              position.coords.longitude
            );
            authLogin(response.token, response.user);
            history.push('/swipe');
          },
          (error) => {
            setError('Veuillez activer la géolocalisation pour continuer');
            setIsLoading(false);
          }
        );
      } else {
        setError('La géolocalisation n\'est pas supportée par votre navigateur');
      }
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500">
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Bon retour!
            </h1>
            <p className="text-gray-500">
              Connectez-vous pour continuer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm
                           focus:ring-2 focus:ring-rose-500 focus:border-transparent
                           transition duration-200 ease-in-out"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm
                           focus:ring-2 focus:ring-rose-500 focus:border-transparent
                           transition duration-200 ease-in-out"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium
                       bg-gradient-to-r from-rose-500 to-purple-500 
                       hover:from-rose-600 hover:to-purple-600
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition duration-200 ease-in-out"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="text-sm">
              <Link to="/forgot-password" className="text-rose-500 hover:text-rose-600">
                Mot de passe oublié?
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Pas encore de compte?{' '}
              <Link to="/signup" className="text-rose-500 hover:text-rose-600 font-medium">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;