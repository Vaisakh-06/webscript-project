import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function Chat() {
  const { user, token } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('team');
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [messages, setMessages] = useState([]);
  const [dmConversations, setDmConversations] = useState([]);
  const [selectedDmUser, setSelectedDmUser] = useState('');
  const [dmMessages, setDmMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingDmMessages, setLoadingDmMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [activeProfileCardId, setActiveProfileCardId] = useState('');
  const [showTeamMembersCard, setShowTeamMembersCard] = useState(false);
  const [unreadTeamById, setUnreadTeamById] = useState({});
  const [unreadDmByUser, setUnreadDmByUser] = useState({});
  const [error, setError] = useState('');

  const endRef = useRef(null);
  const socketRef = useRef(null);
  const selectedTeamRef = useRef('');
  const selectedDmRef = useRef('');
  const viewModeRef = useRef('team');
  const unreadTeamRef = useRef({});
  const unreadDmRef = useRef({});

  const selectedTeam = useMemo(
    () => teams.find(team => team.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );
  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const owner = selectedTeam.username ? [selectedTeam.username] : [];
    const accepted = Array.isArray(selectedTeam.acceptedUsernames) ? selectedTeam.acceptedUsernames : [];
    return Array.from(new Set([...owner, ...accepted].filter(Boolean)));
  }, [selectedTeam]);

  const unreadStorageKey = user?.username ? `teamFinderUnread_${user.username}` : null;
  const totalTeamUnread = Object.values(unreadTeamById).reduce((sum, count) => sum + count, 0);
  const totalDmUnread = Object.values(unreadDmByUser).reduce((sum, count) => sum + count, 0);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const avatarPalette = ['#5E81F4', '#49C9A9', '#F38BA8', '#6C63FF', '#F59E0B', '#22C55E', '#EF4444'];
  const avatarColor = (name) => {
    let hash = 0;
    const value = name || '';
    for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 5) - hash);
    return avatarPalette[Math.abs(hash) % avatarPalette.length];
  };

  const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchMyTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await fetch('http://localhost:8080/chat/my-teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load teams');
      const data = await response.json();
      setTeams(data);
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
    } catch (err) {
      setError('Could not load your teams.');
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchMessages = async (teamId) => {
    if (!teamId) return;
    try {
      setLoadingMessages(true);
      const response = await fetch(`http://localhost:8080/chat/${teamId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data);
      setError('');
    } catch (err) {
      setError('Could not load team chat messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchDmConversations = async () => {
    try {
      const response = await fetch('http://localhost:8080/chat/private/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load direct conversations');
      const data = await response.json();
      setDmConversations(data);
    } catch (err) {
      setError('Could not load direct conversations.');
    }
  };

  const fetchDmMessages = async (otherUsername) => {
    if (!otherUsername) return;
    try {
      setLoadingDmMessages(true);
      const response = await fetch(`http://localhost:8080/chat/private/${encodeURIComponent(otherUsername)}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load direct messages');
      const data = await response.json();
      setDmMessages(data);
    } catch (err) {
      setError('Could not load direct messages.');
    } finally {
      setLoadingDmMessages(false);
    }
  };

  const upsertConversation = (otherUsername, lastContent, lastTimestamp) => {
    setDmConversations(prev => {
      const existing = prev.find(item => item.otherUsername === otherUsername);
      if (existing) {
        return [
          { ...existing, lastContent, lastTimestamp },
          ...prev.filter(item => item.otherUsername !== otherUsername)
        ];
      }
      return [{ otherUsername, lastContent, lastTimestamp }, ...prev];
    });
  };

  const startPrivateChat = (username) => {
    if (!username || username === user?.username) return;
    setViewMode('direct');
    setSelectedDmUser(username);
    fetchDmMessages(username);
    if (!dmConversations.some(conv => conv.otherUsername === username)) {
      upsertConversation(username, '', new Date().toISOString());
    }
  };

  const subscribeTeam = (teamId) => {
    const socket = socketRef.current;
    if (!teamId || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'subscribe', teamId }));
  };

  const subscribePrivate = (otherUsername) => {
    const socket = socketRef.current;
    if (!otherUsername || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'private_subscribe', otherUsername }));
  };

  const persistUnreadState = (teamMap, dmMap) => {
    if (!unreadStorageKey) return;
    const payload = { team: teamMap, dm: dmMap };
    localStorage.setItem(unreadStorageKey, JSON.stringify(payload));
    window.dispatchEvent(new Event('teamfinder-unread-updated'));
  };

  const markTeamAsRead = (teamId) => {
    if (!teamId) return;
    setUnreadTeamById(prev => {
      if (!prev[teamId]) return prev;
      const next = { ...prev };
      delete next[teamId];
      unreadTeamRef.current = next;
      persistUnreadState(next, unreadDmRef.current);
      return next;
    });
  };

  const markDmAsRead = (otherUsername) => {
    if (!otherUsername) return;
    setUnreadDmByUser(prev => {
      if (!prev[otherUsername]) return prev;
      const next = { ...prev };
      delete next[otherUsername];
      unreadDmRef.current = next;
      persistUnreadState(unreadTeamRef.current, next);
      return next;
    });
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;

    const socket = socketRef.current;
    const useSocket = socket && socket.readyState === WebSocket.OPEN;

    try {
      setSending(true);

      if (viewMode === 'team') {
        if (!selectedTeamId) return;
        if (useSocket) {
          socket.send(JSON.stringify({ type: 'message', teamId: selectedTeamId, content }));
        } else {
          const response = await fetch(`http://localhost:8080/chat/${selectedTeamId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
          });
          if (!response.ok) throw new Error('Failed to send message');
          const newMessage = await response.json();
          setMessages(prev => [...prev, newMessage]);
        }
      } else {
        if (!selectedDmUser) return;
        if (useSocket) {
          socket.send(JSON.stringify({ type: 'private_message', toUsername: selectedDmUser, content }));
        } else {
          const response = await fetch(`http://localhost:8080/chat/private/${encodeURIComponent(selectedDmUser)}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
          });
          if (!response.ok) throw new Error('Failed to send private message');
          const newMessage = await response.json();
          setDmMessages(prev => [...prev, newMessage]);
          upsertConversation(selectedDmUser, newMessage.content, newMessage.timestamp);
        }
      }

      setDraft('');
      setError('');
    } catch (err) {
      setError('Could not send message.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchMyTeams();
    fetchDmConversations();
  }, [token]);

  useEffect(() => {
    if (!unreadStorageKey) return;
    try {
      const raw = localStorage.getItem(unreadStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUnreadTeamById(parsed?.team || {});
      setUnreadDmByUser(parsed?.dm || {});
    } catch (e) {
      setUnreadTeamById({});
      setUnreadDmByUser({});
    }
  }, [unreadStorageKey]);

  useEffect(() => {
    if (teams.length === 0) {
      setSelectedTeamId('');
      return;
    }
    const exists = teams.some(team => team.id === selectedTeamId);
    if (!exists) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    selectedTeamRef.current = selectedTeamId;
  }, [selectedTeamId]);

  useEffect(() => {
    selectedDmRef.current = selectedDmUser;
  }, [selectedDmUser]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    unreadTeamRef.current = unreadTeamById;
  }, [unreadTeamById]);

  useEffect(() => {
    unreadDmRef.current = unreadDmByUser;
  }, [unreadDmByUser]);

  useEffect(() => {
    if (!token || !selectedTeamId) return;
    fetchMessages(selectedTeamId);
    markTeamAsRead(selectedTeamId);
    setShowTeamMembersCard(false);
  }, [token, selectedTeamId]);

  useEffect(() => {
    if (!token || !selectedDmUser) return;
    fetchDmMessages(selectedDmUser);
    markDmAsRead(selectedDmUser);
  }, [token, selectedDmUser]);

  useEffect(() => {
    if (viewMode !== 'team') {
      setShowTeamMembersCard(false);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `ws://localhost:8080/ws-chat?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketReady(true);
      if (selectedTeamRef.current) subscribeTeam(selectedTeamRef.current);
      if (selectedDmRef.current) subscribePrivate(selectedDmRef.current);
    };

    socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'message' && payload.message) {
          const incomingTeamId = payload.teamId;
          if (incomingTeamId === selectedTeamRef.current) {
            setMessages(prev => {
              const exists = prev.some(item => item.id === payload.message.id);
              return exists ? prev : [...prev, payload.message];
            });
          }
          if (!(viewModeRef.current === 'team' && incomingTeamId === selectedTeamRef.current)) {
            setUnreadTeamById(prev => {
              const next = { ...prev, [incomingTeamId]: (prev[incomingTeamId] || 0) + 1 };
              unreadTeamRef.current = next;
              persistUnreadState(next, unreadDmRef.current);
              return next;
            });
          }
          return;
        }

        if (payload.type === 'private_message' && payload.message) {
          const incoming = payload.message;
          const isCurrentThread =
            incoming.senderUsername === selectedDmRef.current || incoming.receiverUsername === selectedDmRef.current;

          if (isCurrentThread) {
            setDmMessages(prev => {
              const exists = prev.some(item => item.id === incoming.id);
              return exists ? prev : [...prev, incoming];
            });
          }

          const otherUsername =
            incoming.senderUsername === user?.username ? incoming.receiverUsername : incoming.senderUsername;
          upsertConversation(otherUsername, incoming.content, incoming.timestamp);
          if (!(viewModeRef.current === 'direct' && selectedDmRef.current === otherUsername)) {
            setUnreadDmByUser(prev => {
              const next = { ...prev, [otherUsername]: (prev[otherUsername] || 0) + 1 };
              unreadDmRef.current = next;
              persistUnreadState(unreadTeamRef.current, next);
              return next;
            });
          }
          return;
        }

        if (payload.type === 'error') {
          setError(payload.message || 'Chat socket error.');
        }
      } catch (e) {
        setError('Received invalid socket payload.');
      }
    };

    socket.onclose = () => setSocketReady(false);
    socket.onerror = () => setError('WebSocket disconnected. Falling back to REST send.');

    return () => {
      setSocketReady(false);
      socket.close();
    };
  }, [token, user?.username]);

  useEffect(() => {
    subscribeTeam(selectedTeamId);
  }, [selectedTeamId, socketReady]);

  useEffect(() => {
    subscribePrivate(selectedDmUser);
  }, [selectedDmUser, socketReady]);

  useEffect(() => {
    if (!socketReady) return;
    teams.forEach(team => subscribeTeam(team.id));
  }, [teams, socketReady]);

  useEffect(() => {
    if (!socketReady) return;
    dmConversations.forEach(conv => subscribePrivate(conv.otherUsername));
  }, [dmConversations, socketReady]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dmMessages, viewMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target;
      if (
        target.closest('[data-profile-card="true"]') ||
        target.closest('[data-profile-trigger="true"]') ||
        target.closest('[data-team-members-card="true"]') ||
        target.closest('[data-team-members-trigger="true"]')
      ) {
        return;
      }
      setActiveProfileCardId('');
      setShowTeamMembersCard(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeMessages = viewMode === 'team' ? messages : dmMessages;
  const emptyInput = viewMode === 'team' ? !selectedTeamId : !selectedDmUser;

  const styles = {
    shell: {
      maxWidth: '1240px',
      margin: '18px auto',
      padding: '0 14px',
      fontFamily: '"Segoe UI", "SF Pro Text", Tahoma, sans-serif'
    },
    frame: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '14px',
      height: 'calc(100vh - 52px)'
    },
    card: {
      background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
      borderRadius: '22px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
      overflow: 'hidden'
    },
    sideHeader: {
      padding: '14px',
      borderBottom: '1px solid #eef2ff'
    },
    toggleWrap: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '10px'
    },
    toggleBtn: (active) => ({
      border: active ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
      background: active ? '#eef2ff' : '#fff',
      color: active ? '#3730a3' : '#6b7280',
      borderRadius: '999px',
      padding: '8px 10px',
      fontSize: '12px',
      fontWeight: 700,
      cursor: 'pointer'
    }),
    toggleBtnInner: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    sideScroll: {
      height: 'calc(100% - 92px)',
      overflowY: 'auto',
      padding: '10px'
    },
    sideItem: (isActive) => ({
      display: 'grid',
      gridTemplateColumns: '40px 1fr',
      gap: '10px',
      alignItems: 'center',
      borderRadius: '14px',
      padding: '10px',
      marginBottom: '8px',
      cursor: 'pointer',
      backgroundColor: isActive ? '#edf2ff' : '#fff',
      border: isActive ? '1px solid #c7d2fe' : '1px solid #edf0f7'
    }),
    sideItemMain: {
      minWidth: 0
    },
    avatar: (name) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: avatarColor(name),
      color: '#fff',
      fontWeight: 700,
      fontSize: '13px',
      flexShrink: 0
    }),
    chatCard: {
      background: '#f4f5fb',
      borderRadius: '22px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: '74px 1fr 72px'
    },
    chatTop: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #e9ecf7',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative'
    },
    headerLeft: (clickable) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: clickable ? 'pointer' : 'default',
      padding: clickable ? '4px 6px' : '0',
      borderRadius: '10px',
      transition: 'background-color 0.15s ease'
    }),
    status: {
      fontSize: '12px',
      color: socketReady ? '#059669' : '#6b7280',
      fontWeight: 600
    },
    thread: {
      overflowY: 'auto',
      padding: '18px 22px',
      background: 'radial-gradient(circle at top right, #eef2ff 0%, #f4f5fb 48%, #f8fafc 100%)'
    },
    row: (mine) => ({
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: mine ? 'flex-end' : 'flex-start',
      gap: '10px',
      marginBottom: '14px'
    }),
    bubbleWrap: {
      maxWidth: '70%',
      position: 'relative'
    },
    bubble: (mine) => ({
      padding: '11px 14px',
      borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
      background: mine ? 'linear-gradient(135deg, #5b5fef 0%, #6d75f7 100%)' : '#ffffff',
      color: mine ? '#fff' : '#111827',
      border: mine ? 'none' : '1px solid #e5e7eb',
      boxShadow: mine ? '0 6px 18px rgba(91, 95, 239, 0.35)' : '0 4px 12px rgba(17, 24, 39, 0.06)'
    }),
    msgName: (mine) => ({
      fontSize: '11px',
      marginBottom: '3px',
      opacity: mine ? 0.9 : 0.65,
      fontWeight: 700
    }),
    msgTime: (mine) => ({
      marginTop: '4px',
      fontSize: '10px',
      textAlign: 'right',
      opacity: mine ? 0.78 : 0.55
    }),
    profileCard: {
      position: 'absolute',
      top: '-10px',
      left: '0',
      transform: 'translateY(-100%)',
      minWidth: '210px',
      backgroundColor: '#fff',
      border: '1px solid #dfe6f4',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.16)',
      padding: '10px',
      zIndex: 20
    },
    profileMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px'
    },
    teamMembersCard: {
      position: 'absolute',
      top: '66px',
      left: '12px',
      width: '290px',
      maxHeight: '360px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      border: '1px solid #dfe6f4',
      borderRadius: '14px',
      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)',
      padding: '10px',
      zIndex: 30
    },
    teamMembersTitle: {
      margin: '2px 0 10px 0',
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: 700
    },
    memberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      border: '1px solid #edf0f7',
      borderRadius: '10px',
      padding: '8px',
      marginBottom: '8px'
    },
    memberMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0
    },
    dmMemberBtn: {
      border: '1px solid #5b5fef',
      backgroundColor: '#eef2ff',
      color: '#3730a3',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 700,
      padding: '6px 9px',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    privateAction: {
      width: '100%',
      border: '1px solid #5b5fef',
      backgroundColor: '#eef2ff',
      color: '#3730a3',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      padding: '7px 10px',
      cursor: 'pointer'
    },
    unreadDot: {
      marginLeft: '8px',
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
      padding: '0 5px'
    },
    inputWrap: {
      backgroundColor: '#fff',
      borderTop: '1px solid #e9ecf7',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  };

  if (loadingTeams) {
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading chat...</div>;
  }

  return (
    <div style={styles.shell}>
      <style>{`
        @media (max-width: 980px) {
          .chat-frame { grid-template-columns: 1fr !important; height: auto !important; }
          .chat-panel { height: 72vh; }
          .side-panel { max-height: 320px; }
        }
      `}</style>

      {error && <p style={{ color: '#d11124' }}>{error}</p>}

      <div className="chat-frame" style={styles.frame}>
        <div className="side-panel" style={styles.card}>
          <div style={styles.sideHeader}>
            <div style={styles.toggleWrap}>
              <button style={styles.toggleBtn(viewMode === 'team')} onClick={() => setViewMode('team')}>
                <span style={styles.toggleBtnInner}>
                  Team
                  {totalTeamUnread > 0 ? <span style={styles.unreadDot}>{totalTeamUnread > 9 ? '9+' : totalTeamUnread}</span> : null}
                </span>
              </button>
              <button style={styles.toggleBtn(viewMode === 'direct')} onClick={() => setViewMode('direct')}>
                <span style={styles.toggleBtnInner}>
                  Direct
                  {totalDmUnread > 0 ? <span style={styles.unreadDot}>{totalDmUnread > 9 ? '9+' : totalDmUnread}</span> : null}
                </span>
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {viewMode === 'team' ? 'Your team channels' : '1:1 conversations'}
            </div>
          </div>

          <div style={styles.sideScroll}>
            {viewMode === 'team' ? (
              teams.length === 0 ? (
                <div style={{ padding: '14px', color: '#666' }}>You are not in any teams yet.</div>
              ) : (
                teams.map(team => (
                  <div key={team.id} style={styles.sideItem(team.id === selectedTeamId)} onClick={() => setSelectedTeamId(team.id)}>
                    <div style={styles.avatar(team.teamName || team.username)}>{getInitials(team.teamName || team.username)}</div>
                    <div style={styles.sideItemMain}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {team.teamName || team.competitionName || 'Untitled Team'}
                        </div>
                        {unreadTeamById[team.id] ? (
                          <span style={styles.unreadDot}>{unreadTeamById[team.id] > 9 ? '9+' : unreadTeamById[team.id]}</span>
                        ) : null}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {team.competitionName || 'No competition set'}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              dmConversations.length === 0 ? (
                <div style={{ padding: '14px', color: '#666' }}>No direct conversations yet.</div>
              ) : (
                dmConversations.map(conv => (
                  <div
                    key={conv.otherUsername}
                    style={styles.sideItem(conv.otherUsername === selectedDmUser)}
                    onClick={() => setSelectedDmUser(conv.otherUsername)}
                  >
                    <div style={styles.avatar(conv.otherUsername)}>{getInitials(conv.otherUsername)}</div>
                    <div style={styles.sideItemMain}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{conv.otherUsername}</div>
                        {unreadDmByUser[conv.otherUsername] ? (
                          <span style={styles.unreadDot}>{unreadDmByUser[conv.otherUsername] > 9 ? '9+' : unreadDmByUser[conv.otherUsername]}</span>
                        ) : null}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastContent || 'Start chatting...'}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        <div className="chat-panel" style={styles.chatCard}>
          <div style={styles.chatTop}>
            <div
              style={styles.headerLeft(viewMode === 'team' && !!selectedTeam)}
              data-team-members-trigger={viewMode === 'team' && selectedTeam ? 'true' : undefined}
              onClick={() => {
                if (viewMode === 'team' && selectedTeam) {
                  setShowTeamMembersCard(prev => !prev);
                }
              }}
            >
              <div style={styles.avatar(viewMode === 'team' ? selectedTeam?.teamName || 'Team' : selectedDmUser || 'DM')}>
                {getInitials(viewMode === 'team' ? selectedTeam?.teamName || 'Team' : selectedDmUser || 'DM')}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>
                  {viewMode === 'team'
                    ? (selectedTeam ? (selectedTeam.teamName || selectedTeam.competitionName || 'Team Chat') : 'Select a team')
                    : (selectedDmUser || 'Select a person')}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {viewMode === 'team' ? (selectedTeam?.competitionName || 'Realtime workspace') : 'Private chat'}
                </div>
              </div>
              {viewMode === 'team' && selectedTeam ? (
                <div style={{ color: '#6b7280', fontSize: '12px', marginLeft: '2px' }}>▾</div>
              ) : null}
            </div>
            <span style={styles.status}>{socketReady ? 'Live connected' : 'Reconnecting...'}</span>
            {showTeamMembersCard && viewMode === 'team' && selectedTeam ? (
              <div style={styles.teamMembersCard} data-team-members-card="true">
                <div style={styles.teamMembersTitle}>
                  Members ({selectedTeamMembers.length})
                </div>
                {selectedTeamMembers.map(member => {
                  const mine = member === user?.username;
                  return (
                    <div key={member} style={styles.memberRow}>
                      <div style={styles.memberMeta}>
                        <div style={styles.avatar(member)}>{getInitials(member)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {member}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {member === selectedTeam.username ? 'Team Lead' : 'Member'}
                          </div>
                        </div>
                      </div>
                      {!mine ? (
                        <button
                          style={styles.dmMemberBtn}
                          onClick={() => {
                            startPrivateChat(member);
                            setShowTeamMembersCard(false);
                          }}
                        >
                          Message
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700 }}>You</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div style={styles.thread}>
            {viewMode === 'team' && !selectedTeam ? (
              <p style={{ color: '#666' }}>Choose a team to open chat.</p>
            ) : viewMode === 'direct' && !selectedDmUser ? (
              <p style={{ color: '#666' }}>Hover a teammate message and click "Message privately".</p>
            ) : loadingMessages && viewMode === 'team' ? (
              <p style={{ color: '#666' }}>Loading messages...</p>
            ) : loadingDmMessages && viewMode === 'direct' ? (
              <p style={{ color: '#666' }}>Loading direct messages...</p>
            ) : activeMessages.length === 0 ? (
              <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
            ) : (
              activeMessages.map(msg => {
                const mine = msg.senderUsername === user?.username;
                const canPrivate = viewMode === 'team' && !mine;
                return (
                  <div key={msg.id} style={styles.row(mine)}>
                    {!mine && <div style={styles.avatar(msg.senderUsername)}>{getInitials(msg.senderUsername)}</div>}
                    <div style={styles.bubbleWrap}>
                      <div
                        style={styles.bubble(mine)}
                        data-profile-trigger={canPrivate ? 'true' : undefined}
                        onClick={() => {
                          if (!canPrivate) return;
                          setActiveProfileCardId(prev => (prev === msg.id ? '' : msg.id));
                        }}
                      >
                        <div style={styles.msgName(mine)}>{msg.senderUsername}</div>
                        <div>{msg.content}</div>
                        <div style={styles.msgTime(mine)}>{formatTime(msg.timestamp)}</div>
                      </div>
                      {canPrivate && activeProfileCardId === msg.id && (
                        <div style={styles.profileCard} data-profile-card="true">
                          <div style={styles.profileMeta}>
                            <div style={styles.avatar(msg.senderUsername)}>{getInitials(msg.senderUsername)}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{msg.senderUsername}</div>
                              <div style={{ color: '#6b7280', fontSize: '11px' }}>Team member</div>
                            </div>
                          </div>
                          <button
                            style={styles.privateAction}
                            onClick={() => {
                              startPrivateChat(msg.senderUsername);
                              setActiveProfileCardId('');
                            }}
                          >
                            Message privately
                          </button>
                        </div>
                      )}
                    </div>
                    {mine && <div style={styles.avatar(msg.senderUsername)}>{getInitials(msg.senderUsername)}</div>}
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <div style={styles.inputWrap}>
            <input
              type="text"
              placeholder={emptyInput ? 'Select a chat first' : 'Type a message...'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={emptyInput || sending}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '999px',
                border: '1px solid #d8deeb',
                backgroundColor: '#f8fafc',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={emptyInput || sending || !draft.trim()}
              style={{
                padding: '11px 18px',
                border: 'none',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #5b5fef 0%, #6d75f7 100%)',
                color: '#fff',
                cursor: 'pointer',
                opacity: emptyInput || sending || !draft.trim() ? 0.6 : 1,
                fontWeight: 700
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
