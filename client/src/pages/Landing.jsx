import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreeBg from '../components/ThreeBg.jsx';

export default function Landing() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem('auth');
      setAuth(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function logout() {
    localStorage.removeItem('auth');
    setAuth(null);
    navigate('/login');
  }

  return (
    <div className="page">
      <ThreeBg variant="hero" />
      <div className="content">
        <div className="container">
          <section className="hero card">
            <div>
              <h1>Mira</h1>
              <p>Minimal, organization-aware task management. Fast. Focused. Beautiful.</p>
              <div className="cta">
                {!auth ? (
                  <>
                    <Link className="btn" to="/signup">Get Started</Link>
                    <Link className="btn" to="/login">I have an account</Link>
                  </>
                ) : (
                  <>
                    <Link className="btn" to="/app">Open App</Link>
                    <button className="btn" onClick={logout} type="button">Logout</button>
                  </>
                )}
              </div>
              <p className="small" style={{ marginTop: 10 }}>
                Built with MERN • JWT • MVC • 3D powered by Three.js
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
