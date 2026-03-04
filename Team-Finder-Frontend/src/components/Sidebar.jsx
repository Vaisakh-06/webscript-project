import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function Sidebar() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [chatUnreadTotal, setChatUnreadTotal] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user?.username) {
      setChatUnreadTotal(0);
      return;
    }

    const unreadKey = `teamFinderUnread_${user.username}`;
    const refreshUnread = () => {
      try {
        const raw = localStorage.getItem(unreadKey);
        if (!raw) {
          setChatUnreadTotal(0);
          return;
        }
        const parsed = JSON.parse(raw);
        const teamTotal = Object.values(parsed?.team || {}).reduce((sum, count) => sum + count, 0);
        const dmTotal = Object.values(parsed?.dm || {}).reduce((sum, count) => sum + count, 0);
        setChatUnreadTotal(teamTotal + dmTotal);
      } catch (e) {
        setChatUnreadTotal(0);
      }
    };

    refreshUnread();
    window.addEventListener('storage', refreshUnread);
    window.addEventListener('teamfinder-unread-updated', refreshUnread);
    return () => {
      window.removeEventListener('storage', refreshUnread);
      window.removeEventListener('teamfinder-unread-updated', refreshUnread);
    };
  }, [user?.username]);

  useEffect(() => {
    if (!user?.username || !token) return;
    if (location.pathname === '/chat') return;

    const unreadKey = `teamFinderUnread_${user.username}`;
    let isActive = true;
    let socket = null;
    let teamIds = [];
    let dmUsers = [];

    const publishUnread = (nextPayload) => {
      localStorage.setItem(unreadKey, JSON.stringify(nextPayload));
      window.dispatchEvent(new Event('teamfinder-unread-updated'));
    };

    const incrementTeamUnread = (teamId) => {
      if (!teamId) return;
      try {
        const raw = localStorage.getItem(unreadKey);
        const parsed = raw ? JSON.parse(raw) : {};
        const teamMap = parsed?.team || {};
        const dmMap = parsed?.dm || {};
        const next = {
          team: { ...teamMap, [teamId]: (teamMap[teamId] || 0) + 1 },
          dm: dmMap
        };
        publishUnread(next);
      } catch (e) {
        publishUnread({ team: { [teamId]: 1 }, dm: {} });
      }
    };

    const incrementDmUnread = (otherUsername) => {
      if (!otherUsername) return;
      try {
        const raw = localStorage.getItem(unreadKey);
        const parsed = raw ? JSON.parse(raw) : {};
        const teamMap = parsed?.team || {};
        const dmMap = parsed?.dm || {};
        const next = {
          team: teamMap,
          dm: { ...dmMap, [otherUsername]: (dmMap[otherUsername] || 0) + 1 }
        };
        publishUnread(next);
      } catch (e) {
        publishUnread({ team: {}, dm: { [otherUsername]: 1 } });
      }
    };

    const subscribeAll = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      teamIds.forEach((teamId) => {
        socket.send(JSON.stringify({ type: 'subscribe', teamId }));
      });
      dmUsers.forEach((otherUsername) => {
        socket.send(JSON.stringify({ type: 'private_subscribe', otherUsername }));
      });
    };

    const boot = async () => {
      try {
        const [teamsRes, dmRes] = await Promise.all([
          fetch('http://localhost:8080/chat/my-teams', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:8080/chat/private/conversations', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!isActive) return;
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          teamIds = teams.map(item => item.id).filter(Boolean);
        }
        if (dmRes.ok) {
          const conversations = await dmRes.json();
          dmUsers = conversations.map(item => item.otherUsername).filter(Boolean);
        }

        socket = new WebSocket(`ws://localhost:8080/ws-chat?token=${encodeURIComponent(token)}`);
        socket.onopen = () => {
          if (!isActive) return;
          subscribeAll();
        };
        socket.onmessage = (event) => {
          if (!isActive) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'message' && payload.message) {
              incrementTeamUnread(payload.teamId);
              return;
            }
            if (payload.type === 'private_message' && payload.message) {
              const incoming = payload.message;
              const otherUsername =
                incoming.senderUsername === user.username ? incoming.receiverUsername : incoming.senderUsername;
              incrementDmUnread(otherUsername);
            }
          } catch (e) {
            // Ignore malformed payloads
          }
        };
      } catch (e) {
        // Silent fallback: no live sidebar updates if boot fails
      }
    };

    boot();

    return () => {
      isActive = false;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [location.pathname, token, user?.username]);

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
    linkContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    unreadDot: {
      minWidth: '18px',
      height: '18px',
      borderRadius: '999px',
      backgroundColor: '#ef4444',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 700,
      padding: '0 5px',
      marginLeft: '8px'
    },
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
        <Link to="/chat" style={styles.link(location.pathname === '/chat')}>
          <span style={styles.linkContent}>
            Chat
            {chatUnreadTotal > 0 ? <span style={styles.unreadDot}>{chatUnreadTotal > 9 ? '9+' : chatUnreadTotal}</span> : null}
          </span>
        </Link>
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
