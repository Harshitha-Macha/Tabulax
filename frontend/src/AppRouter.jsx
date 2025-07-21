import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import App from './App';
import HomePage from './homepage';

function RouterWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'Guest');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.setItem('username', 'Guest');
      setUsername('Guest');
    }
  }, [isAuthenticated, username]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('Guest');
    localStorage.removeItem('isAuthenticated');
    localStorage.setItem('username', 'Guest');
    navigate('/home');
  };

  return (
    <Routes>
      <Route path="/home" element={
        <HomePage
          onLogin={() => {
            if (localStorage.getItem('isAuthenticated')) {
              navigate('/transformations', { replace: true });
            } else {
              navigate('/sign in');
            }
          }}
          username={username}
          onLogout={handleLogout}
        />
      } />
      <Route path="/sign in" element={
        <SignIn onAuth={(user) => {
          setIsAuthenticated(true);
          setUsername(user || 'User');
          navigate('/transformations', { replace: true });
        }} onSwitch={() => navigate('/sign up')} onGoHome={() => navigate('/home')} />
      } />
      <Route path="/sign up" element={
        <SignUp onAuth={(user) => {
          setIsAuthenticated(true);
          setUsername(user || 'User');
          navigate('/transformations', { replace: true });
        }} onSwitch={() => navigate('/sign in')} onGoHome={() => navigate('/home')} />
      } />
      <Route path="/transformations" element={
        isAuthenticated ? <App onLogout={handleLogout} /> : <Navigate to="/sign in" />
      } />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <RouterWrapper />
    </Router>
  );
}