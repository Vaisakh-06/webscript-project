import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function Dashboard() {
  const { user, token, updateUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    branch: user?.branch || '',
    college: user?.college || '',
    experienceTag: user?.experienceTag || 'Beginner'
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSaveProfile = async () => {
    // Replace with your actual backend update endpoint
    try {
      const response = await fetch('http://localhost:8080/user/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        updateUser(formData); // Update local context
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      // Fallback for UI testing if endpoint isn't ready
      updateUser(formData);
      setIsEditing(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      // Assuming you have an endpoint like this, or you just update the whole user object
      const currentSkills = user.skill || [];
      const updatedSkills = [...currentSkills, newSkill.trim()];
      
      const response = await fetch('http://localhost:8080/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...user, skill: updatedSkills })
      });

      if (response.ok) {
        updateUser({ skill: updatedSkills });
        setNewSkill('');
      }
    } catch (err) {
      // Fallback for UI testing
      updateUser({ skill: [...(user.skill || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = (user.skill || []).filter(s => s !== skillToRemove);
    try {
      const response = await fetch('http://localhost:8080/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...user, skill: updatedSkills })
      });
      if (response.ok) updateUser({ skill: updatedSkills });
    } catch (err) {
      updateUser({ skill: updatedSkills }); // UI fallback
    }
  };

  // --- INJECTED CSS ---
  const styleSheet = `
    .profile-wrapper { max-width: 800px; margin: 30px auto; padding: 0 20px; font-family: Arial, sans-serif; }
    
    .profile-card {
      background-color: #fff; border-radius: 12px; border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; position: relative;
    }

    .cover-photo {
      height: 140px; border-radius: 12px 12px 0 0;
      background: linear-gradient(135deg, #a0b4b7 0%, #cbd6d8 100%);
    }

    .avatar-container { padding: 0 24px; display: flex; justify-content: space-between; align-items: flex-end; margin-top: -60px; margin-bottom: 15px; }
    
    .main-avatar {
      width: 130px; height: 130px; border-radius: 50%; border: 4px solid #fff;
      background-color: #0a66c2; color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 50px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-edit {
      background-color: transparent; color: #0a66c2; border: 1px solid #0a66c2;
      padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-bottom: 15px;
    }
    .btn-edit:hover { background-color: #e8f3ff; border-width: 2px; padding: 7px 15px; }

    .btn-save { background-color: #0a66c2; color: #fff; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }

    .profile-info { padding: 0 24px 24px 24px; }
    .profile-name { font-size: 24px; font-weight: bold; color: #111; margin: 0 0 5px 0; }
    .profile-headline { font-size: 16px; color: #111; margin: 0 0 5px 0; }
    .profile-sub { font-size: 14px; color: #666; margin: 0; }

    .section-title { font-size: 20px; font-weight: bold; color: #111; margin: 0 0 15px 0; padding: 24px 24px 0 24px; }
    .section-content { padding: 15px 24px 24px 24px; color: #444; line-height: 1.5; white-space: pre-wrap; font-size: 15px; }

    .form-input { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
    
    .skill-pill {
      display: inline-flex; align-items: center; background-color: #0a66c2; color: #fff;
      padding: 6px 14px; border-radius: 16px; font-size: 14px; font-weight: bold; margin: 0 8px 8px 0;
    }
    .btn-remove-skill { background: none; border: none; color: #fff; font-weight: bold; margin-left: 8px; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; }
    .btn-remove-skill:hover { color: #ffcccc; }
  `;

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Please log in.</div>;

  return (
    <div className="profile-wrapper">
      <style>{styleSheet}</style>

      {/* --- HEADER CARD --- */}
      <div className="profile-card">
        <div className="cover-photo"></div>
        <div className="avatar-container">
          <div className="main-avatar">{(user.name || user.username).charAt(0).toUpperCase()}</div>
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>✎ Edit Profile</button>
          ) : (
            <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
          )}
        </div>

        <div className="profile-info">
          {!isEditing ? (
            <>
              <h1 className="profile-name">{user.name || user.username}</h1>
              <p className="profile-headline">{user.branch || 'Add your branch'} at {user.college || 'Add your college'}</p>
              <p className="profile-sub">@{user.username} • {user.experienceTag || 'Beginner'} Level • 👍 {user.likesReceived || 0} Endorsements</p>
            </>
          ) : (
            <div style={{ maxWidth: '400px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Full Name</label>
              <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Branch / Role</label>
              <input className="form-input" type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>College / Organization</label>
              <input className="form-input" type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Experience Level</label>
              <select className="form-input" value={formData.experienceTag} onChange={e => setFormData({...formData, experienceTag: e.target.value})}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* --- ABOUT CARD --- */}
      <div className="profile-card">
        <h2 className="section-title">About</h2>
        <div className="section-content">
          {!isEditing ? (
            user.bio || 'Write a short bio to tell people about yourself and your goals.'
          ) : (
            <textarea className="form-input" style={{ minHeight: '100px' }} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="I am a passionate developer looking for..." />
          )}
        </div>
      </div>

      {/* --- SKILLS CARD --- */}
      <div className="profile-card">
        <h2 className="section-title">Skills</h2>
        <div className="section-content">
          <div style={{ marginBottom: '15px' }}>
            {user.skill && user.skill.length > 0 ? (
              user.skill.map((s, index) => (
                <span key={index} className="skill-pill">
                  {s} 
                  {isEditing && <button className="btn-remove-skill" onClick={() => handleRemoveSkill(s)}>×</button>}
                </span>
              ))
            ) : (
              <p style={{ color: '#888', margin: 0 }}>No skills added yet.</p>
            )}
          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
              <input className="form-input" style={{ marginBottom: 0 }} type="text" placeholder="Add a skill (e.g., React, Java)" value={newSkill} onChange={e => setNewSkill(e.target.value)} />
              <button className="btn-save" onClick={handleAddSkill}>Add</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}