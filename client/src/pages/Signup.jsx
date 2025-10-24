import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../services/api.js';
import ThreeBg from '../components/ThreeBg.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '', inviteEmails: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        const inviteEmails = form.inviteEmails
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const data = await api.signup({
          name: form.name,
          email: form.email,
          password: form.password,
          orgAction: 'create',
          orgName: form.orgName,
          inviteEmails
        });
        saveAuth({ token: data.token, user: data.user, organization: data.organization });
        navigate('/app');
      } else {
        const data = await api.signup({
          name: form.name,
          email: form.email,
          password: form.password,
          orgAction: 'join',
          orgName: form.orgName
        });
        saveAuth({ token: data.token, user: data.user, organization: data.organization });
        navigate('/app');
      }
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
          <div className="card" style={{ width: 560, maxWidth: '100%' }}>
            <h2 style={{ marginTop: 0 }}>Signup</h2>
            <div style={{ marginBottom: 12 }}>
              <label className="radio">
                <input type="radio" name="mode" value="create" checked={mode === 'create'} onChange={() => setMode('create')} />
                <span>Create Organization</span>
              </label>
              <label className="radio" style={{ marginLeft: 12 }}>
                <input type="radio" name="mode" value="join" checked={mode === 'join'} onChange={() => setMode('join')} />
                <span>Join Existing Organization</span>
              </label>
            </div>
            <form onSubmit={onSubmit}>
              <div>
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={onChange} required />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </div>
              <div>
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={onChange} required />
              </div>
              <div>
                <label>Organization Name</label>
                <input name="orgName" value={form.orgName} onChange={onChange} required />
              </div>
              {mode === 'create' && (
                <div>
                  <label>Invite Member Emails (comma separated)</label>
                  <input name="inviteEmails" placeholder="member1@example.com, member2@example.com" value={form.inviteEmails} onChange={onChange} />
                </div>
              )}
              {mode === 'join' && (
                <p className="small">Note: You can only join if this email address has been invited to the selected organization.</p>
              )}
              {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
              <button disabled={loading} style={{ width: '100%' }}>{loading ? 'Processing...' : 'Create Account'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
