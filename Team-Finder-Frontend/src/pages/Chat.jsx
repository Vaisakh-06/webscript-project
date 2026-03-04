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
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const selectedTeam = useMemo(
    () => teams.find(team => team.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

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

  const fetchMessages = async (teamId, silent = false) => {
    if (!teamId) return;
    try {
      if (!silent) setLoadingMessages(true);
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
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !selectedTeamId) return;

    try {
      setSending(true);
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
    if (!token || !selectedTeamId) return;

    fetchMessages(selectedTeamId);
    const timer = setInterval(() => {
      fetchMessages(selectedTeamId, true);
    }, 3000);

    return () => clearInterval(timer);
  }, [token, selectedTeamId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const styles = {
    wrapper: {
      maxWidth: '1100px',
      margin: '24px auto',
      padding: '0 16px',
      fontFamily: 'Arial, sans-serif'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '16px'
    },
    panel: {
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    teamItem: isActive => ({
      padding: '12px 14px',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: isActive ? '#e8f3ff' : '#fff',
      cursor: 'pointer'
    }),
    chatHeader: {
      padding: '14px 16px',
      borderBottom: '1px solid #e0e0e0',
      fontWeight: 'bold'
    },
    messageArea: {
      height: '460px',
      overflowY: 'auto',
      padding: '16px',
      backgroundColor: '#fafafa'
    },
    bubble: isMine => ({
      maxWidth: '70%',
      marginBottom: '10px',
      marginLeft: isMine ? 'auto' : '0',
      padding: '10px 12px',
      borderRadius: '12px',
      backgroundColor: isMine ? '#0a66c2' : '#fff',
      color: isMine ? '#fff' : '#222',
      border: isMine ? 'none' : '1px solid #e8e8e8'
    }),
    inputRow: {
      display: 'flex',
      gap: '8px',
      padding: '12px',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#fff'
    }
  };

  if (loadingTeams) {
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading chat...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <h1 style={{ marginBottom: '16px' }}>Team Chat</h1>
      {error && <p style={{ color: '#d11124' }}>{error}</p>}

      <div style={styles.layout}>
        <div style={styles.panel}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
            My Teams
          </div>
          {teams.length === 0 ? (
            <div style={{ padding: '14px', color: '#666' }}>You are not in any teams yet.</div>
          ) : (
            teams.map(team => (
              <div
                key={team.id}
                style={styles.teamItem(team.id === selectedTeamId)}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div style={{ fontWeight: 'bold', color: '#111' }}>
                  {team.teamName || team.competitionName || 'Untitled Team'}
                </div>
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  {team.competitionName || 'No competition set'}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.chatHeader}>
            {selectedTeam ? (selectedTeam.teamName || selectedTeam.competitionName || 'Team Chat') : 'Select a team'}
          </div>

          <div style={styles.messageArea}>
            {!selectedTeam ? (
              <p style={{ color: '#666' }}>Choose a team to open chat.</p>
            ) : loadingMessages ? (
              <p style={{ color: '#666' }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={styles.bubble(msg.senderUsername === user?.username)}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', fontWeight: 'bold' }}>
                    {msg.senderUsername}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <div style={styles.inputRow}>
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
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!selectedTeam || sending || !draft.trim()}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#0a66c2',
                color: '#fff',
                cursor: 'pointer',
                opacity: !selectedTeam || sending || !draft.trim() ? 0.6 : 1
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
