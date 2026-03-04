import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/public/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }) 
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json(); 
      login(data.user, data.token);
      navigate('/dashboard');

    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styleSheet = `
    .auth-container {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: calc(100vh - 60px); padding: 20px; font-family: Arial, sans-serif;
    }
    .auth-card {
      background-color: #fff; width: 100%; max-width: 350px; padding: 32px;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;
    }
    .auth-logo { font-size: 28px; font-weight: bold; color: #0a66c2; margin: 0 0 10px 0; text-align: center; }
    .auth-subtitle { font-size: 14px; color: #666; margin: 0 0 24px 0; text-align: center; }
    
    .auth-input {
      width: 100%; padding: 14px 12px; margin-bottom: 16px; border: 1px solid #8c8c8c;
      border-radius: 4px; box-sizing: border-box; font-size: 16px; outline: none; transition: 0.2s;
    }
    .auth-input:focus { border-color: #0a66c2; box-shadow: 0 0 0 1px #0a66c2; }
    
    .auth-btn {
      width: 100%; background-color: #0a66c2; color: #fff; border: none; padding: 14px;
      border-radius: 24px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 8px;
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
        <p className="auth-subtitle">Stay updated on your professional world</p>

        {error && <p style={{ color: '#d11124', backgroundColor: '#fef0f0', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input 
            className="auth-input"
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            className="auth-input"
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button className="auth-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          New to TeamFinder? <Link to="/signup" className="auth-link">Join now</Link>
        </div>
      </div>
    </div>
  );
}