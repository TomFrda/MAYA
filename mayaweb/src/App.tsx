import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import SwipePage from './components/pages/SwipePage';
import ProfilePage from './components/pages/ProfilePage';
import MatchPage from './components/pages/MatchPages'; // Import MatchPage
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import MessagesPage from './components/pages/MessagesPage';
import PrivateRoute from './components/routes/PrivateRoute';
import PublicRoute from './components/routes/PublicRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="main-content">
            <Switch>
              {/* Routes publiques - redirection vers /swipe si connecté */}
              <PublicRoute path="/" exact component={HomePage} />
              <PublicRoute path="/login" component={LoginPage} />
              <PublicRoute path="/signup" component={SignUpPage} />
              {/* Routes privées - redirection vers /login si non connecté */}
              <PrivateRoute path="/swipe" component={SwipePage} />
              <PrivateRoute path="/profile" component={ProfilePage} />
              <PrivateRoute path="/matches" component={MatchPage} />
              <PrivateRoute path="/messages" component={MessagesPage} />
              
              {/* Redirection par défaut vers la page d'accueil */}
              <Redirect to="/" />
            </Switch>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;