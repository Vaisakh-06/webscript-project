import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    branch: '',
    college: '',
    skillsString: '' // We will split this into an array before sending
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Convert comma-separated skills string into a proper array
    const skillArray = formData.skillsString
      ? formData.skillsString.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const payload = {
      name: formData.name,
      username: formData.username,
      password: formData.password,
      email: formData.email,
      branch: formData.branch,
      college: formData.college,
      skill: skillArray // Assuming your backend User.java expects a List<String> called 'skill'
    };

    try {
      const response = await fetch('http://localhost:8080/public/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Account created successfully! Please log in.');
        navigate('/login');
      } else {
        const errText = await response.text();
        throw new Error(errText || 'Failed to create account. Username may already exist.');
      }
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styleSheet = `
    .auth-container {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: calc(100vh - 60px); padding: 40px 20px; font-family: Arial, sans-serif;
    }
    .auth-card {
      background-color: #fff; width: 100%; max-width: 450px; padding: 32px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;
    }
    .auth-logo { font-size: 28px; font-weight: bold; color: #0a66c2; margin: 0 0 10px 0; text-align: center; }
    .auth-subtitle { font-size: 14px; color: #666; margin: 0 0 24px 0; text-align: center; }
    
    .input-group { margin-bottom: 16px; }
    .input-label { display: block; font-size: 13px; color: #444; font-weight: bold; margin-bottom: 4px; }
    .optional-tag { color: #888; font-weight: normal; font-size: 12px; }

    .auth-input {
      width: 100%; padding: 12px; border: 1px solid #8c8c8c;
      border-radius: 4px; box-sizing: border-box; font-size: 15px; outline: none; transition: 0.2s;
    }
    .auth-input:focus { border-color: #0a66c2; box-shadow: 0 0 0 1px #0a66c2; }
    
    .auth-btn {
      width: 100%; background-color: #0a66c2; color: #fff; border: none; padding: 14px;
      border-radius: 24px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 12px;
    }
    .auth-btn:hover { background-color: #004182; }
    .auth-btn:disabled { background-color: #a0b4b7; cursor: not-allowed; }
    
    .auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: #444; }
    .auth-link { color: #0a66c2; font-weight: bold; text-decoration: none; }
    .auth-link:hover { text-decoration: underline; }
  `;

  return (
    <div className="auth-container">
      <style>{styleSheet}</style>

      <div className="auth-card">
        <h1 className="auth-logo">TeamFinder</h1>
        <p className="auth-subtitle">Make the most of your professional life</p>

        {error && <p style={{ color: '#d11124', backgroundColor: '#fef0f0', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <form onSubmit={handleSignup}>
          
          {/* Required Fields */}
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input className="auth-input" type="text" placeholder="Garv Sharma" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Username *</label>
            <input className="auth-input" type="text" placeholder="garv_sharma" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Password *</label>
            <input className="auth-input" type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          {/* Optional Fields Divider */}
          <div style={{ borderTop: '1px solid #ebebeb', margin: '24px 0 16px 0', position: 'relative', textAlign: 'center' }}>
            <span style={{ backgroundColor: '#fff', padding: '0 10px', color: '#888', fontSize: '12px', position: 'relative', top: '-8px' }}>Optional Profile Details</span>
          </div>

          <div className="input-group">
            <label className="input-label">Email <span className="optional-tag">(Optional)</span></label>
            <input className="auth-input" type="email" placeholder="you@college.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Branch <span className="optional-tag">(Optional)</span></label>
              <input className="auth-input" type="text" placeholder="Computer Science" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">College <span className="optional-tag">(Optional)</span></label>
              <input className="auth-input" type="text" placeholder="Tech University" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Skills <span className="optional-tag">(Comma separated, Optional)</span></label>
            <input className="auth-input" type="text" placeholder="Java, React, Python..." value={formData.skillsString} onChange={e => setFormData({...formData, skillsString: e.target.value})} />
          </div>

          <button className="auth-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Agree & Join'}
          </button>
        </form>

        <div className="auth-footer">
          Already on TeamFinder? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}