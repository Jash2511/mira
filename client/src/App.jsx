import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Nav() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  });
  useEffect(() => {
    const onStorage = () => setAuth(() => {
      const raw = localStorage.getItem('auth');
      return raw ? JSON.parse(raw) : null;
    });
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <nav className="mira-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" className="mira-brand">Mira<span className="accent">.</span></Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!auth && <Link to="/login">Login</Link>}
        {!auth && <Link to="/signup">Signup</Link>}
        {auth && <Link to="/app">App</Link>}
        {auth && (
          <button onClick={() => { localStorage.removeItem('auth'); setAuth(null); navigate('/login'); }}>Logout</button>
        )}
      </div>
    </nav>
  );
}

function PublicOnlyRoute({ children }) {
  const auth = localStorage.getItem('auth');
  if (auth) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
