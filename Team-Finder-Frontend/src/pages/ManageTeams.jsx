import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function ManageTeams() {
  const { user, token } = useContext(AuthContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/post/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      
      const userPosts = data.filter(post => post.username === user.username);
      setMyPosts(userPosts.reverse()); 
    } catch (err) {
      setError('Could not load your teams. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyPosts();
  }, [token]);

  const handleAccept = async (postId, targetUsername) => {
    try {
      const response = await fetch(`http://localhost:8080/post/${postId}/accept?ownerUsername=${user.username}&targetUsername=${targetUsername}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMyPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const updatedRequests = post.requestedUsernames.filter(name => name !== targetUsername);
            const updatedAccepted = post.acceptedUsernames ? [...post.acceptedUsernames, targetUsername] : [targetUsername];
            return { ...post, requestedUsernames: updatedRequests, acceptedUsernames: updatedAccepted };
          }
          return post;
        }));
      } else {
        alert('Failed to accept user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (postId, targetUsername) => {
    if (!window.confirm(`Are you sure you want to reject ${targetUsername}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:8080/post/${postId}/reject?ownerUsername=${user.username}&targetUsername=${targetUsername}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMyPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const updatedRequests = post.requestedUsernames.filter(name => name !== targetUsername);
            return { ...post, requestedUsernames: updatedRequests };
          }
          return post;
        }));
      } else {
        alert('Failed to reject user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- INJECTED CSS FOR DASHBOARD UI ---
  const styleSheet = `
    .manage-wrapper { max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: Arial, sans-serif; }
    
    .team-card {
      background-color: #fff; border-radius: 12px; border: 1px solid #e0e0e0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px; overflow: hidden;
    }

    .team-header {
      background: linear-gradient(to right, #f8fafd, #ffffff);
      padding: 20px 24px; border-bottom: 1px solid #e0e0e0;
      border-left: 6px solid #0a66c2;
    }

    .team-title { margin: 0 0 5px 0; font-size: 24px; color: #111; }
    .team-meta { margin: 0; color: #666; font-size: 14px; }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    
    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
    }

    .section-col { padding: 24px; }
    .left-col { border-right: 1px solid #e0e0e0; background-color: #fff; }
    .right-col { background-color: #fcfcfc; }

    .section-title {
      font-size: 16px; font-weight: bold; color: #333;
      margin: 0 0 15px 0; display: flex; align-items: center; justify-content: space-between;
    }
    
    .count-badge {
      background-color: #e8f3ff; color: #0a66c2; padding: 2px 8px;
      border-radius: 12px; font-size: 12px;
    }

    .user-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px; background-color: #fff; border: 1px solid #ebebeb;
      border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    .user-info { display: flex; align-items: center; gap: 10px; }
    
    .mini-avatar {
      width: 36px; height: 36px; border-radius: 50%; background-color: #44719b;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 14px;
    }

    .user-name { font-weight: bold; color: #111; font-size: 14px; }
    .role-tag { font-size: 12px; color: #888; display: block; }

    .btn-group { display: flex; gap: 8px; }
    
    .btn-accept {
      background-color: #057642; color: #fff; border: none; padding: 6px 16px;
      border-radius: 16px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;
    }
    .btn-accept:hover { background-color: #046036; }

    .btn-reject {
      background-color: transparent; color: #d11124; border: 1px solid #d11124;
      padding: 6px 16px; border-radius: 16px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;
    }
    .btn-reject:hover { background-color: #fef0f0; }

    .empty-state { text-align: center; color: #888; font-size: 14px; padding: 20px 0; font-style: italic; }
  `;

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Please log in to manage your teams.</div>;

  return (
    <div className="manage-wrapper">
      <style>{styleSheet}</style>

      <h1 style={{ marginBottom: '30px', color: '#111' }}>Manage My Teams</h1>
      
      {loading && <p style={{ color: '#666' }}>Loading your dashboard...</p>}
      {error && <p style={{ color: '#d11124' }}>{error}</p>}

      {myPosts.length > 0 ? (
        myPosts.map((post) => (
          <div key={post.id} className="team-card">
            
            {/* --- TEAM HEADER --- */}
            <div className="team-header">
              <h2 className="team-title">{post.teamName}</h2>
              <p className="team-meta">
                <strong>Target:</strong> {post.competitionName} &nbsp;|&nbsp; 
                <strong> Recruiting:</strong> {post.position} ({post.experienceTag})
              </p>
            </div>

            <div className="content-grid">
              
              {/* --- LEFT COL: PENDING REQUESTS --- */}
              <div className="section-col left-col">
                <h3 className="section-title">
                  Pending Applications
                  <span className="count-badge">{post.requestedUsernames?.length || 0}</span>
                </h3>
                
                {post.requestedUsernames && post.requestedUsernames.length > 0 ? (
                  post.requestedUsernames.map(requester => (
                    <div key={requester} className="user-row">
                      <div className="user-info">
                        <div className="mini-avatar">{requester.charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="user-name">{requester}</span>
                          <span className="role-tag">Wants to join</span>
                        </div>
                      </div>
                      <div className="btn-group">
                        <button className="btn-accept" onClick={() => handleAccept(post.id, requester)}>Accept</button>
                        <button className="btn-reject" onClick={() => handleReject(post.id, requester)}>Decline</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No pending requests at the moment.</div>
                )}
              </div>

              {/* --- RIGHT COL: CURRENT ROSTER --- */}
              <div className="section-col right-col">
                <h3 className="section-title">
                  Active Roster
                  <span className="count-badge">{(post.acceptedUsernames?.length || 0) + 1}</span>
                </h3>

                {/* The Team Lead (You) */}
                <div className="user-row" style={{ borderLeft: '4px solid #0a66c2' }}>
                  <div className="user-info">
                    <div className="mini-avatar" style={{ backgroundColor: '#0a66c2' }}>{user.username.charAt(0).toUpperCase()}</div>
                    <div>
                      <span className="user-name">{user.username}</span>
                      <span className="role-tag" style={{ color: '#0a66c2', fontWeight: 'bold' }}>Team Lead (You)</span>
                    </div>
                  </div>
                </div>

                {/* Accepted Members */}
                {post.acceptedUsernames && post.acceptedUsernames.length > 0 && (
                  post.acceptedUsernames.map(member => (
                    <div key={member} className="user-row">
                      <div className="user-info">
                        <div className="mini-avatar" style={{ backgroundColor: '#057642' }}>{member.charAt(0).toUpperCase()}</div>
                        <div>
                          <span className="user-name">{member}</span>
                          <span className="role-tag">Member</span>
                        </div>
                      </div>
                      {/* Future feature: A "Remove" button could go here if needed! */}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        ))
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🚀</span>
            <h3 style={{ margin: '0 0 10px 0', color: '#111' }}>You haven't started any teams yet.</h3>
            <p style={{ color: '#666' }}>Go to the Feed to post your first project requirement and start recruiting!</p>
          </div>
        )
      )}
    </div>
  );
}