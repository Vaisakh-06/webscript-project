import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function Search() {
  const { user, token } = useContext(AuthContext); 

  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('skill'); // Defaulting to skill as it's the most common search
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      let endpoint = '';
      if (searchType === 'name') endpoint = `/home/search-by-name/${query}`;
      if (searchType === 'skill') endpoint = `/home/search-by-skill/${query}`;
      if (searchType === 'username') endpoint = `/home/search-by-username/${query}`;

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          throw new Error('No users found matching that criteria.');
        }
        throw new Error('Something went wrong with the search.');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setResults(data);
      } else if (data && typeof data === 'object') {
        setResults([data]);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (targetUsername) => {
    try {
      const response = await fetch(`http://localhost:8080/home/like/${targetUsername}?likerUsername=${user.username}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setResults((prevResults) =>
          prevResults.map((r) => {
            if (r.username === targetUsername) {
              const updatedLikedBy = r.likedBy ? [...r.likedBy, user.username] : [user.username];
              return {
                ...r,
                likesReceived: (r.likesReceived || 0) + 1,
                likedBy: updatedLikedBy,
              };
            }
            return r;
          })
        );
      } else {
        alert('You have already liked this profile or an error occurred!');
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  // --- INJECTED CSS FOR CARDS & HOVER EFFECTS ---
  const styleSheet = `
    .search-container { max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: Arial, sans-serif; }
    
    .search-bar-card {
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      margin-bottom: 30px;
      border: 1px solid #e0e0e0;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .user-card {
      background-color: #fff;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .user-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }

    .cover-photo { height: 70px; background-color: #a0b4b7; }
    
    .avatar-wrapper {
      margin-top: -40px;
      display: flex;
      justify-content: center;
    }
    
    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #0a66c2;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      border: 4px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card-content { padding: 15px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; }
    
    .profile-link {
      font-size: 18px;
      font-weight: bold;
      color: #000;
      text-decoration: none;
    }
    .profile-link:hover { text-decoration: underline; color: #0a66c2; }

    .skill-pill {
      display: inline-block;
      background-color: #f3f2ef;
      color: #000;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      margin: 3px;
    }

    .btn-like {
      width: calc(100% - 30px);
      margin: 0 15px 15px 15px;
      padding: 8px 0;
      border-radius: 20px;
      font-weight: bold;
      border: 1px solid #0a66c2;
      background-color: transparent;
      color: #0a66c2;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-like:hover { background-color: #e8f3ff; border-width: 2px; padding: 7px 0; }
    .btn-like:disabled { border-color: #ccc; color: #888; background-color: #f3f2ef; cursor: not-allowed; }
  `;

  return (
    <div className="search-container">
      <style>{styleSheet}</style>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="search-bar-card">
        <h2 style={{ marginTop: 0, color: '#333' }}>Find Teammates</h2>
        <form style={{ display: 'flex', gap: '10px' }} onSubmit={handleSearch}>
          <select 
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', backgroundColor: '#f9f9f9', fontWeight: 'bold', color: '#666' }} 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="skill">By Skill</option>
            <option value="name">By Name</option>
            <option value="username">By Username</option>
          </select>

          <input
            style={{ flex: 1, padding: '12px 16px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '15px' }}
            type="text"
            placeholder={searchType === 'skill' ? 'E.g., React, Java, Python...' : `Search by ${searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            style={{ backgroundColor: '#0a66c2', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }} 
            type="submit"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>Searching network...</p>}
      {error && <p style={{ color: '#d11124', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

      {/* --- RESULTS GRID SECTION --- */}
      <div className="grid-container">
        {results.length > 0 ? (
          results.map((result) => {
            const hasLiked = result.likedBy && result.likedBy.includes(user?.username);
            const isSelf = user && result.username === user.username;

            return (
              <div key={result.id || result.username} className="user-card">
                
                {/* Top Half: Cover Photo & Avatar */}
                <div className="cover-photo"></div>
                <div className="avatar-wrapper">
                  <div className="avatar-circle">
                    {(result.name || result.username).charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Bottom Half: Info & Button */}
                <div className="card-content">
                  
                  {/* Clickable Name navigating to Public Profile */}
                  <Link to={`/profile/${result.username}`} className="profile-link">
                    {result.name || result.username}
                  </Link>
                  
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    {result.branch || 'Branch N/A'} • {result.college || 'College N/A'}
                  </p>
                  
                  <div style={{ margin: '10px 0', flexGrow: 1 }}>
                    {result.skill && result.skill.length > 0 ? (
                      result.skill.slice(0, 4).map((s, idx) => ( // Show up to 4 skills
                        <span key={idx} className="skill-pill">{s}</span>
                      ))
                    ) : (
                      <span className="skill-pill" style={{ backgroundColor: 'transparent', color: '#888' }}>No skills listed</span>
                    )}
                  </div>
                  
                  <p style={{ margin: '0', fontSize: '12px', color: '#888', fontWeight: 'bold' }}>
                    👍 {result.likesReceived || 0} Endorsements
                  </p>
                </div>

                {/* Connect/Like Button */}
                {!isSelf && (
                  <button
                    className="btn-like"
                    onClick={() => handleLike(result.username)}
                    disabled={hasLiked}
                  >
                    {hasLiked ? 'Endorsed ✓' : 'Endorse Profile 👍'}
                  </button>
                )}
                
              </div>
            );
          })
        ) : (
          !loading && !error && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🌐</span>
              <h3>Expand Your Network</h3>
              <p>Search for specific skills to find the perfect teammate for your next project.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}