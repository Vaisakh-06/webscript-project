import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8080/home/search-by-username/${username}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();
        setProfileUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [username, token]);

  // Reusing the exact same stylesheet logic from Dashboard for consistency
  const styleSheet = `
    .profile-wrapper { max-width: 800px; margin: 30px auto; padding: 0 20px; font-family: Arial, sans-serif; }
    
    .btn-back {
      background: none; border: none; color: #666; font-weight: bold; font-size: 15px;
      cursor: pointer; margin-bottom: 20px; display: flex; align-items: center; gap: 5px;
    }
    .btn-back:hover { color: #0a66c2; text-decoration: underline; }

    .profile-card {
      background-color: #fff; border-radius: 12px; border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px;
    }

    .cover-photo {
      height: 140px; border-radius: 12px 12px 0 0;
      background: linear-gradient(135deg, #a0b4b7 0%, #cbd6d8 100%);
    }

    .avatar-container { padding: 0 24px; margin-top: -60px; margin-bottom: 15px; }
    
    .main-avatar {
      width: 130px; height: 130px; border-radius: 50%; border: 4px solid #fff;
      background-color: #44719b; color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 50px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .profile-info { padding: 0 24px 24px 24px; }
    .profile-name { font-size: 24px; font-weight: bold; color: #111; margin: 0 0 5px 0; }
    .profile-headline { font-size: 16px; color: #111; margin: 0 0 5px 0; }
    .profile-sub { font-size: 14px; color: #666; margin: 0; }

    .section-title { font-size: 20px; font-weight: bold; color: #111; margin: 0 0 15px 0; padding: 24px 24px 0 24px; }
    .section-content { padding: 15px 24px 24px 24px; color: #444; line-height: 1.5; white-space: pre-wrap; font-size: 15px; }

    .skill-pill {
      display: inline-block; background-color: #f3f2ef; color: #000;
      padding: 6px 14px; border-radius: 16px; font-size: 14px; font-weight: bold; margin: 0 8px 8px 0; border: 1px solid #e0e0e0;
    }
  `;

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#d11124' }}>{error}</div>;
  if (!profileUser) return null;

  return (
    <div className="profile-wrapper">
      <style>{styleSheet}</style>

      <button className="btn-back" onClick={() => navigate(-1)}>← Back to Search</button>

      {/* --- HEADER CARD --- */}
      <div className="profile-card">
        <div className="cover-photo"></div>
        <div className="avatar-container">
          <div className="main-avatar">{(profileUser.name || profileUser.username).charAt(0).toUpperCase()}</div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{profileUser.name || profileUser.username}</h1>
          <p className="profile-headline">{profileUser.branch || 'Branch N/A'} at {profileUser.college || 'College N/A'}</p>
          <p className="profile-sub">@{profileUser.username} • {profileUser.experienceTag || 'Beginner'} Level • 👍 {profileUser.likesReceived || 0} Endorsements</p>
        </div>
      </div>

      {/* --- ABOUT CARD --- */}
      <div className="profile-card">
        <h2 className="section-title">About</h2>
        <div className="section-content">
          {profileUser.bio || 'This user has not written a bio yet.'}
        </div>
      </div>

      {/* --- SKILLS CARD --- */}
      <div className="profile-card">
        <h2 className="section-title">Skills</h2>
        <div className="section-content">
          {profileUser.skill && profileUser.skill.length > 0 ? (
            profileUser.skill.map((s, index) => (
              <span key={index} className="skill-pill">{s}</span>
            ))
          ) : (
            <p style={{ color: '#888', margin: 0 }}>No skills listed.</p>
          )}
        </div>
      </div>

    </div>
  );
}