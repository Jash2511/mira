import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../services/api.js';
import ThreeBg from '../components/ThreeBg.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', orgName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email: form.email, password: form.password, orgName: form.orgName });
      saveAuth({ token: data.token, user: data.user, organization: data.organization });
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <ThreeBg variant="form" />
      <div className="content">
        <div className="container" style={{ display: 'grid', placeItems: 'center', paddingTop: 40 }}>
          <div className="card" style={{ width: 420, maxWidth: '100%' }}>
            <h2 style={{ marginTop: 0 }}>Login</h2>
            <form onSubmit={onSubmit}>
              <div>
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </div>
              <div>
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={onChange} required />
              </div>
              <div>
                <label>Organization</label>
                <input name="orgName" placeholder="Your organization name" value={form.orgName} onChange={onChange} required />
              </div>
              {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
              <button disabled={loading} style={{ width: '100%' }}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
