import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  
  // Injecting custom CSS for the 3D hover effects
  const styleSheet = `
    .feature-card {
      background-color: #fff;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      border: 1px solid #e0e0e0;
      cursor: default;
    }
    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      border-color: #0a66c2;
    }
    .hero-container {
      position: relative;
      height: 500px;
      background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 102, 194, 0.4); /* LinkedIn Blue Tint */
      backdrop-filter: blur(4px); /* The slight blur effect */
    }
  `;

  const styles = {
    heroContent: {
      position: 'relative',
      zIndex: 1,
      color: '#fff',
      textAlign: 'center',
      padding: '0 20px',
      maxWidth: '800px'
    },
    headline: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    subheadline: {
      fontSize: '20px',
      lineHeight: '1.5',
      marginBottom: '40px',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
    },
    ctaButton: {
      backgroundColor: '#fff',
      color: '#0a66c2',
      padding: '14px 32px',
      borderRadius: '28px',
      fontSize: '18px',
      fontWeight: 'bold',
      textDecoration: 'none',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      transition: 'background-color 0.2s ease'
    },
    featuresSection: {
      maxWidth: '1200px',
      margin: '-50px auto 50px auto', // Pulls the cards slightly up into the hero image
      padding: '0 20px',
      position: 'relative',
      zIndex: 2,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    icon: {
      fontSize: '40px',
      marginBottom: '15px',
      display: 'block'
    }
  };

  return (
    <div>
      <style>{styleSheet}</style>

      {/* --- HERO SECTION --- */}
      <div className="hero-container">
        <div className="hero-overlay"></div>
        <div style={styles.heroContent}>
          <h1 style={styles.headline}>Build Amazing Projects Together.</h1>
          <p style={styles.subheadline}>
            TeamFinder is the ultimate platform for students to connect, form powerful teams, 
            and dominate campus hackathons and club events.
          </p>
          <Link to="/signup" style={styles.ctaButton}>
            Get Started Now
          </Link>
        </div>
      </div>

      {/* --- 3D FEATURE CARDS SECTION --- */}
      <div style={styles.featuresSection}>
        
        <div className="feature-card">
          <span style={styles.icon}>🔍</span>
          <h3 style={{ color: '#333', fontSize: '22px', marginBottom: '10px' }}>Find the Perfect Match</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>
            Search for teammates by specific skills, names, or usernames. Filter through experience tags to find the exact piece missing from your project.
          </p>
        </div>

        <div className="feature-card">
          <span style={styles.icon}>🤝</span>
          <h3 style={{ color: '#333', fontSize: '22px', marginBottom: '10px' }}>Form Powerful Teams</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>
            Post your project requirements on the Feed. Review incoming join requests, accept top talent, and manage your roster seamlessly.
          </p>
        </div>

        <div className="feature-card">
          <span style={styles.icon}>🏆</span>
          <h3 style={{ color: '#333', fontSize: '22px', marginBottom: '10px' }}>Official Campus Events</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>
            Never miss out. Discover verified hackathons, coding competitions, and club events posted directly by Club Presidents.
          </p>
        </div>

      </div>
    </div>
  );
}