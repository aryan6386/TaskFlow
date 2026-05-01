'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';

export default function SignupPage() {
  const { login } = useAuth();
  const [form, setForm]     = useState({ name:'', email:'', password:'', role:'member' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.post('/api/auth/signup', form);
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <h1>Task<span>Flow</span></h1>
          <p>Create your account</p>
        </div>
        <h2 className="auth-title">Get started</h2>
        <p className="auth-subtitle">Create your account to manage projects and tasks</p>
        {error && <div className="auth-error">⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="signup-name" className="form-input" type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signup-email" className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="signup-password" className="form-input" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="role-switch">
              {['member','admin'].map(r => (
                <div className="role-option" key={r}>
                  <input type="radio" id={`role-${r}`} name="role" value={r}
                    checked={form.role === r} onChange={() => setForm({...form, role: r})} />
                  <label htmlFor={`role-${r}`}>
                    {r === 'admin' ? '👑 Admin' : '👤 Member'}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button id="signup-submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'12px'}} disabled={loading} type="submit">
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
