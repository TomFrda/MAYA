import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import SwipePage from './components/pages/SwipePage';
import ProfilePage from './components/pages/ProfilePage';
import MessagesPage from './components/pages/MessagesPage';
import SettingsPage from './components/pages/SettingsPage';
import EditProfilePage from './components/pages/EditProfilePage';
import LikedProfilesPage from './components/pages/LikedProfilesPage';
import MatchesPage from './components/pages/MatchesPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './assets/styles/index.css';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="flex-grow">
          <AuthContext.Consumer>
            {({ token }) => (
              <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/signup" component={SignUpPage} />
                {token ? (
                  <>
                    <Route path="/swipe" component={SwipePage} />
                    <Route path="/profile" component={ProfilePage} />
                    <Route path="/messages" component={MessagesPage} />
                    <Route path="/settings" component={SettingsPage} />
                    <Route path="/edit-profile" component={EditProfilePage} />
                    <Route path="/liked-profiles" component={LikedProfilesPage} />
                    <Route path="/matches" component={MatchesPage} />
                  </>
                ) : (
                  <Redirect to="/login" />
                )}
              </Switch>
            )}
          </AuthContext.Consumer>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
