import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function Feed() {
  const { user, token } = useContext(AuthContext);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Post Form State
  const [isExpanded, setIsExpanded] = useState(false); // Controls if the form is open
  const [formData, setFormData] = useState({
    competitionName: '',
    competitionDate: '',
    position: '',
    experienceTag: 'Beginner',
    teamName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/post/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.reverse()); 
    } catch (err) {
      setError('Could not load feed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const postPayload = { ...formData, username: user.username };

    try {
      const response = await fetch('http://localhost:8080/post/add-post', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postPayload)
      });

      if (response.ok) {
        setFormData({ competitionName: '', competitionDate: '', position: '', experienceTag: 'Beginner', teamName: '' });
        setIsExpanded(false);
        fetchPosts();
      } else {
        alert('Failed to create post.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestJoin = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/post/${postId}/request?requesterUsername=${user.username}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPosts((prevPosts) => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const updatedRequests = post.requestedUsernames ? [...post.requestedUsernames, user.username] : [user.username];
              return { ...post, requestedUsernames: updatedRequests };
            }
            return post;
          })
        );
      } else {
        alert('Could not send request. You may have already requested to join.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Injecting CSS for hover states and transitions
  const styleSheet = `
    .post-card {
      background-color: #fff;
      border-radius: 10px;
      margin-bottom: 16px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .post-action-btn {
      flex: 1;
      padding: 12px;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: #666;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .post-action-btn:hover:not(:disabled) {
      background-color: #ebebeb;
    }
    .form-input {
      width: 100%;
      padding: 12px;
      margin-bottom: 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 14px;
    }
    .form-input:focus {
      outline: none;
      border-color: #0a66c2;
    }
  `;

  const styles = {
    container: { maxWidth: '580px', margin: '20px auto', padding: '0 15px', fontFamily: 'Arial, sans-serif' },
    
    // Create Post Box Styles
    createBox: { backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    createHeader: { display: 'flex', gap: '10px', alignItems: 'center' },
    avatar: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0a66c2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', flexShrink: 0 },
    dummyInput: { flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #b2b2b2', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontWeight: '500', textAlign: 'left', transition: 'background-color 0.2s' },
    formExpanded: { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ebebeb' },
    btnPrimary: { backgroundColor: '#0a66c2', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', float: 'right' },
    
    // Post Styles
    postHeader: { display: 'flex', gap: '12px', padding: '16px 16px 8px 16px', alignItems: 'flex-start' },
    postAuthor: { fontSize: '15px', fontWeight: 'bold', color: '#000', margin: '0 0 2px 0' },
    postMeta: { fontSize: '12px', color: '#666', margin: 0 },
    postBody: { padding: '0 16px 16px 16px' },
    postTitle: { fontSize: '18px', fontWeight: 'bold', color: '#000', margin: '10px 0 8px 0' },
    badge: { display: 'inline-block', backgroundColor: '#e8f3ff', color: '#0a66c2', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' },
    detailRow: { margin: '0 0 8px 0', fontSize: '14px', color: '#333' },
    actionBar: { display: 'flex', padding: '4px 8px', borderTop: '1px solid #ebebeb' }
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Please log in.</div>;

  return (
    <div style={styles.container}>
      <style>{styleSheet}</style>

      {/* --- CREATE POST BOX (LinkedIn Style) --- */}
      <div style={styles.createBox}>
        <div style={styles.createHeader}>
          <div style={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
          <button 
            style={styles.dummyInput} 
            onClick={() => setIsExpanded(true)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f2ef'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
          >
            Start a team requirement...
          </button>
        </div>

        {isExpanded && (
          <div style={styles.formExpanded}>
            <form onSubmit={handleCreatePost}>
              <input className="form-input" type="text" placeholder="Competition / Hackathon Name" required value={formData.competitionName} onChange={e => setFormData({...formData, competitionName: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input className="form-input" type="date" required value={formData.competitionDate} onChange={e => setFormData({...formData, competitionDate: e.target.value})} />
                <input className="form-input" type="text" placeholder="Team Name (e.g., The Bug Smashers)" required value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input className="form-input" type="text" placeholder="Position Needed (e.g., Backend Dev)" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                <select className="form-input" value={formData.experienceTag} onChange={e => setFormData({...formData, experienceTag: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <button type="button" onClick={() => setIsExpanded(false)} style={{ ...styles.btnPrimary, backgroundColor: 'transparent', color: '#666', marginRight: '10px' }}>Cancel</button>
                <button type="submit" style={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Requirement'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* --- FEED TIMELINE --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
        <span style={{ fontSize: '12px', color: '#666' }}>Sort by: <strong>Top</strong></span>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading feed...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {posts.length > 0 ? (
        posts.map((post) => {
          const isOwner = post.username === user.username;
          const hasRequested = post.requestedUsernames && post.requestedUsernames.includes(user.username);
          const isAccepted = post.acceptedUsernames && post.acceptedUsernames.includes(user.username);

          return (
            <div key={post.id} className="post-card">
              
              <div style={styles.postHeader}>
                <div style={{ ...styles.avatar, width: '40px', height: '40px', fontSize: '16px', backgroundColor: '#44719b' }}>
                  {post.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={styles.postAuthor}>{post.username}</h4>
                  <p style={styles.postMeta}>Recruiting for {post.competitionName} • {post.competitionDate}</p>
                </div>
              </div>

              <div style={styles.postBody}>
                <h3 style={styles.postTitle}>Looking for: {post.position}</h3>
                <span style={styles.badge}>{post.experienceTag} Level</span>
                
                <p style={styles.detailRow}><strong>Team Name:</strong> {post.teamName}</p>
                <p style={styles.detailRow}><strong>Current Team Size:</strong> {(post.acceptedUsernames?.length || 0) + 1}</p>
              </div>

              <div style={styles.actionBar}>
                {isOwner ? (
                  <button className="post-action-btn" disabled style={{ color: '#0a66c2', fontWeight: 'bold' }}>
                    📊 Manage Responses in My Teams
                  </button>
                ) : isAccepted ? (
                  <button className="post-action-btn" disabled style={{ color: '#057642', fontWeight: 'bold' }}>
                    ✓ You are in this Team
                  </button>
                ) : hasRequested ? (
                  <button className="post-action-btn" disabled style={{ color: '#666' }}>
                    🕒 Request Sent
                  </button>
                ) : (
                  <button className="post-action-btn" onClick={() => handleRequestJoin(post.id)}>
                    ➕ Request to Join Team
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        !loading && <p style={{ textAlign: 'center', color: '#666' }}>No posts yet. Be the first to start a team!</p>
      )}
    </div>
  );
}