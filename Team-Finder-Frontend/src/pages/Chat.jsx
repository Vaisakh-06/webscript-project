import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function Chat() {
  const { user, token } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const socketRef = useRef(null);
  const selectedTeamRef = useRef('');

  const selectedTeam = useMemo(
    () => teams.find(team => team.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

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
      setError('Could not load chat messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !selectedTeamId) return;

    try {
      setSending(true);
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
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
      setDraft('');
    } catch (err) {
      setError('Could not send message.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyTeams();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `ws://localhost:8080/ws-chat?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketReady(true);
      if (selectedTeamId) {
        socket.send(JSON.stringify({ type: 'subscribe', teamId: selectedTeamId }));
      }
    };

    socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'message' && payload.teamId === selectedTeamRef.current && payload.message) {
          setMessages(prev => {
            const exists = prev.some(item => item.id === payload.message.id);
            return exists ? prev : [...prev, payload.message];
          });
        }
        if (payload.type === 'error') {
          setError(payload.message || 'Chat socket error.');
        }
      } catch (e) {
        setError('Received invalid chat payload.');
      }
    };

    socket.onclose = () => setSocketReady(false);
    socket.onerror = () => setError('WebSocket disconnected. Falling back to REST send.');

    return () => {
      setSocketReady(false);
      socket.close();
    };
  }, [token]);

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
    if (!token || !selectedTeamId) return;
    fetchMessages(selectedTeamId);
  }, [token, selectedTeamId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedTeamId || !socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'subscribe', teamId: selectedTeamId }));
  }, [selectedTeamId, socketReady]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const styles = {
    shell: {
      maxWidth: '1240px',
      margin: '18px auto',
      padding: '0 14px',
      fontFamily: '"Segoe UI", "SF Pro Text", Tahoma, sans-serif'
    },
    frame: {
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
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
    teamHeader: {
      padding: '18px 16px 12px',
      borderBottom: '1px solid #eef2ff'
    },
    teamTitle: {
      margin: 0,
      fontSize: '16px',
      fontWeight: 700,
      color: '#121826'
    },
    teamSub: {
      margin: '4px 0 0',
      fontSize: '12px',
      color: '#6b7280'
    },
    teamScroll: {
      height: 'calc(100% - 76px)',
      overflowY: 'auto',
      padding: '10px 10px 14px'
    },
    teamItem: (isActive) => ({
      display: 'grid',
      gridTemplateColumns: '40px 1fr',
      gap: '10px',
      alignItems: 'center',
      borderRadius: '14px',
      padding: '10px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: '0.2s ease',
      backgroundColor: isActive ? '#edf2ff' : '#fff',
      border: isActive ? '1px solid #c7d2fe' : '1px solid #edf0f7'
    }),
    teamAvatar: (name) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: avatarColor(name),
      color: '#fff',
      fontWeight: 700,
      fontSize: '13px'
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
      justifyContent: 'space-between'
    },
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
    bubble: (mine) => ({
      maxWidth: '70%',
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
          .team-panel { max-height: 300px; }
          .chat-panel { height: 70vh; }
        }
      `}</style>
      {error && <p style={{ color: '#d11124' }}>{error}</p>}

      <div className="chat-frame" style={styles.frame}>
        <div className="team-panel" style={styles.card}>
          <div style={styles.teamHeader}>
            <h2 style={styles.teamTitle}>Team Chats</h2>
            <p style={styles.teamSub}>Pick a team to start talking</p>
          </div>
          <div style={styles.teamScroll}>
          {teams.length === 0 ? (
            <div style={{ padding: '14px', color: '#666' }}>You are not in any teams yet.</div>
          ) : (
            teams.map(team => (
              <div
                key={team.id}
                style={styles.teamItem(team.id === selectedTeamId)}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div style={styles.teamAvatar(team.teamName || team.username)}>
                  {getInitials(team.teamName || team.username)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team.teamName || team.competitionName || 'Untitled Team'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team.competitionName || 'No competition set'}
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        <div className="chat-panel" style={styles.chatCard}>
          <div style={styles.chatTop}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.teamAvatar(selectedTeam?.teamName || 'Team Chat')}>
                {getInitials(selectedTeam?.teamName || 'Chat')}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>
                  {selectedTeam ? (selectedTeam.teamName || selectedTeam.competitionName || 'Team Chat') : 'Select a team'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {selectedTeam?.competitionName || 'Realtime workspace'}
                </div>
              </div>
            </div>
            <span style={styles.status}>{socketReady ? 'Live connected' : 'Reconnecting...'}</span>
          </div>

          <div style={styles.thread}>
            {!selectedTeam ? (
              <p style={{ color: '#666' }}>Choose a team to open chat.</p>
            ) : loadingMessages ? (
              <p style={{ color: '#666' }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={styles.row(msg.senderUsername === user?.username)}>
                  {msg.senderUsername !== user?.username && (
                    <div style={styles.teamAvatar(msg.senderUsername)}>{getInitials(msg.senderUsername)}</div>
                  )}
                  <div style={styles.bubble(msg.senderUsername === user?.username)}>
                    <div style={styles.msgName(msg.senderUsername === user?.username)}>{msg.senderUsername}</div>
                    <div>{msg.content}</div>
                    <div style={styles.msgTime(msg.senderUsername === user?.username)}>{formatTime(msg.timestamp)}</div>
                  </div>
                  {msg.senderUsername === user?.username && (
                    <div style={styles.teamAvatar(msg.senderUsername)}>{getInitials(msg.senderUsername)}</div>
                  )}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <div style={styles.inputWrap}>
            <input
              type="text"
              placeholder={selectedTeam ? 'Type a message...' : 'Select a team first'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={!selectedTeam || sending}
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
              disabled={!selectedTeam || sending || !draft.trim()}
              style={{
                padding: '11px 18px',
                border: 'none',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #5b5fef 0%, #6d75f7 100%)',
                color: '#fff',
                cursor: 'pointer',
                opacity: !selectedTeam || sending || !draft.trim() ? 0.6 : 1,
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
