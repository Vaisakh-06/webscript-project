import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/Authcontext';

export default function Events() {
  const { user, token } = useContext(AuthContext);
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    heading: '', date: '', description: '', maxTeamSize: '', prizePool: '', venue: '', clubName: ''
  });

  // Check if the user is a President (Handling both raw 'PRESIDENT' and Spring's 'ROLE_PRESIDENT')
  const isPresident = user && user.roles && (user.roles.includes('PRESIDENT') || user.roles.includes('ROLE_PRESIDENT'));

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/events/all', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.reverse()); 
    } catch (err) {
      setError('Could not load events. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const eventPayload = { ...formData, postedBy: user.username };

    try {
      const response = await fetch('http://localhost:8080/events/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        setFormData({ heading: '', date: '', description: '', maxTeamSize: '', prizePool: '', venue: '', clubName: '' });
        setShowForm(false);
        fetchEvents(); 
      } else {
        alert('Failed to create event.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this official event?")) return;

    try {
      const response = await fetch(`http://localhost:8080/events/delete/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        alert('Failed to delete event.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to format the date "YYYY-MM-DD" into Month and Day
  const formatDateBlock = (dateString) => {
    if (!dateString) return { month: 'TBD', day: '-' };
    const dateObj = new Date(dateString);
    return {
      month: dateObj.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: dateObj.getDate()
    };
  };

  // --- INJECTED CSS FOR PROFESSIONAL STYLING ---
  const styleSheet = `
    .events-wrapper { max-width: 800px; margin: 30px auto; padding: 0 20px; font-family: Arial, sans-serif; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 16px;
    }
    
    .btn-create {
      background-color: #0a66c2; color: #fff; border: none; padding: 10px 20px;
      border-radius: 24px; font-weight: bold; cursor: pointer; transition: background-color 0.2s;
    }
    .btn-create:hover { background-color: #004182; }

    .form-card {
      background-color: #f9fafb; padding: 24px; border-radius: 12px;
      border: 1px solid #d1d5db; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    
    .form-input {
      width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ccc;
      border-radius: 6px; box-sizing: border-box; font-size: 14px; outline: none;
    }
    .form-input:focus { border-color: #0a66c2; box-shadow: 0 0 0 2px rgba(10, 102, 194, 0.2); }

    .event-card {
      background-color: #fff; border-radius: 12px; border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden;
      display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;
    }
    .event-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }

    .event-banner { height: 8px; background: linear-gradient(90deg, #0a66c2 0%, #004182 100%); }

    .event-content { display: flex; padding: 24px; gap: 20px; }

    .calendar-block {
      background-color: #f3f2ef; border-radius: 8px; min-width: 70px; height: 75px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 1px solid #e0e0e0; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .cal-month { color: #d11124; font-size: 13px; font-weight: 900; letter-spacing: 1px; margin-bottom: 2px; }
    .cal-day { font-size: 28px; font-weight: bold; color: #111; line-height: 1; }

    .event-details { flex-grow: 1; }
    
    .event-title { margin: 0 0 5px 0; font-size: 22px; color: #111; }
    .event-host { margin: 0 0 15px 0; color: #666; font-size: 15px; }

    .badges-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .event-badge {
      background-color: #e8f3ff; color: #0a66c2; padding: 6px 12px;
      border-radius: 16px; font-size: 13px; font-weight: 600;
    }

    .event-desc { color: #444; line-height: 1.6; white-space: pre-wrap; font-size: 15px; margin: 0; }

    .event-footer {
      background-color: #f9fafb; padding: 12px 24px; border-top: 1px solid #e0e0e0;
      display: flex; justify-content: space-between; align-items: center;
    }
    
    .btn-delete {
      background: transparent; color: #d11124; border: 1px solid #d11124;
      padding: 6px 16px; border-radius: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s;
    }
    .btn-delete:hover { background-color: #fef0f0; }
  `;

  return (
    <div className="events-wrapper">
      <style>{styleSheet}</style>

      {/* --- HEADER --- */}
      <div className="page-header">
        <h1 style={{ margin: 0, fontSize: '28px', color: '#111' }}>Official Campus Events</h1>
        {isPresident && (
          <button className="btn-create" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel Form' : '➕ Host Event'}
          </button>
        )}
      </div>

      {/* --- PRESIDENT'S HOSTING FORM --- */}
      {isPresident && showForm && (
        <div className="form-card">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#111' }}>Create an Official Event</h3>
          <form onSubmit={handleCreateEvent}>
            <input className="form-input" type="text" placeholder="Event Heading (e.g., Annual Spring Hackathon)" required value={formData.heading} onChange={e => setFormData({...formData, heading: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input className="form-input" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <input className="form-input" type="text" placeholder="Club / Host Name" required value={formData.clubName} onChange={e => setFormData({...formData, clubName: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input className="form-input" type="text" placeholder="Venue (e.g., Main Auditorium)" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
              <input className="form-input" type="text" placeholder="Prize Pool (e.g., $1000 or Swag)" required value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: e.target.value})} />
              <input className="form-input" type="number" placeholder="Max Team Size" required value={formData.maxTeamSize} onChange={e => setFormData({...formData, maxTeamSize: e.target.value})} />
            </div>

            <textarea className="form-input" placeholder="Full event description, rules, and requirements..." style={{ minHeight: '100px', resize: 'vertical' }} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            
            <button className="btn-create" type="submit" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Official Event'}
            </button>
          </form>
        </div>
      )}

      {/* --- EVENTS LIST --- */}
      {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading upcoming events...</p>}
      {error && <p style={{ color: '#d11124', textAlign: 'center' }}>{error}</p>}

      {events.length > 0 ? (
        events.map((event) => {
          const { month, day } = formatDateBlock(event.date);

          return (
            <div key={event.id} className="event-card">
              <div className="event-banner"></div>
              
              <div className="event-content">
                {/* Visual Calendar Block */}
                <div className="calendar-block">
                  <span className="cal-month">{month}</span>
                  <span className="cal-day">{day}</span>
                </div>

                <div className="event-details">
                  <h2 className="event-title">{event.heading}</h2>
                  <p className="event-host">Hosted by <strong>{event.clubName}</strong></p>
                  
                  <div className="badges-row">
                    <span className="event-badge">📍 {event.venue}</span>
                    <span className="event-badge">👥 Max Team: {event.maxTeamSize}</span>
                    <span className="event-badge">🏆 Prize: {event.prizePool}</span>
                  </div>

                  <p className="event-desc">{event.description}</p>
                </div>
              </div>

              {/* Footer / Admin Actions */}
              <div className="event-footer">
                <span style={{ fontSize: '12px', color: '#888' }}>
                  Posted by @{event.postedBy}
                </span>
                
                {isPresident && (
                  <button className="btn-delete" onClick={() => handleDeleteEvent(event.id)}>
                    Delete Event
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        !loading && (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🗓️</span>
            <h3 style={{ margin: '0 0 10px 0', color: '#111' }}>No Upcoming Events</h3>
            <p style={{ color: '#666', margin: 0 }}>Check back later for new hackathons and club activities.</p>
          </div>
        )
      )}
    </div>
  );
}