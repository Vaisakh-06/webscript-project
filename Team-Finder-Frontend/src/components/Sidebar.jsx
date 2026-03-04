import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    sidebar: {
      width: '250px',
      minWidth: '250px', // Prevents it from shrinking
      height: '100vh',
      backgroundColor: '#fff',
      borderRight: '1px solid #e0e0e0',
      position: 'sticky', // This is the magic word!
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    },
    logoContainer: {
      padding: '0 20px 20px 20px',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '20px'
    },
    logoText: {
      color: '#0a66c2',
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      textDecoration: 'none'
    },
    navMenu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      padding: '0 10px'
    },
    link: (isActive) => ({
      textDecoration: 'none',
      color: isActive ? '#0a66c2' : '#666',
      padding: '12px 20px',
      borderRadius: '8px',
      fontWeight: isActive ? 'bold' : 'normal',
      backgroundColor: isActive ? '#e8f3ff' : 'transparent',
      transition: 'all 0.2s ease',
      display: 'block'
    }),
    bottomSection: {
      marginTop: 'auto',
      padding: '20px',
      borderTop: '1px solid #e0e0e0'
    },
    logoutBtn: {
      width: '100%',
      padding: '10px',
      backgroundColor: 'transparent',
      color: '#666',
      border: '1px solid #ccc',
      borderRadius: '24px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <Link to="/" style={styles.logoText}>TeamFinder</Link>
      </div>

      <nav style={styles.navMenu}>
        <Link to="/" style={styles.link(location.pathname === '/')}>Home</Link>
        <Link to="/feed" style={styles.link(location.pathname === '/feed')}>Team Feed</Link>
        <Link to="/search" style={styles.link(location.pathname === '/search')}>Find Members</Link>
        <Link to="/events" style={styles.link(location.pathname === '/events')}>Campus Events</Link>
        <Link to="/chat" style={styles.link(location.pathname === '/chat')}>Chat</Link>
      </nav>

      <div style={styles.bottomSection}>
        {user ? (
          <>
            <Link to="/dashboard" style={{...styles.link(location.pathname === '/dashboard'), marginBottom: '10px'}}>👤 My Profile</Link>
            <Link to="/manage-teams" style={{...styles.link(location.pathname === '/manage-teams'), marginBottom: '20px'}}>⚙️ Manage Teams</Link>
            <button style={styles.logoutBtn} onClick={handleLogout} onMouseOver={(e) => e.target.style.backgroundColor = '#f3f2ef'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{...styles.link(location.pathname === '/login'), marginBottom: '10px'}}>Log In</Link>
            <Link to="/signup" style={{...styles.link(location.pathname === '/signup'), backgroundColor: '#0a66c2', color: '#fff', textAlign: 'center', borderRadius: '24px'}}>Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}
