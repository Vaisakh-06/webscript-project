import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import { AuthProvider } from './context/Authcontext';
import ProtectedRoute from './components/ProtectedRoute';
import Search from './pages/Search';
import Feed from './pages/Feed';
import ManageTeams from './pages/ManageTeams';
import PublicProfile from './pages/PublicProfile';
import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* MAIN WRAPPER: Starts here and doesn't close until the very bottom */}
        <div style={{ display: 'flex', backgroundColor: '#f3f2ef', minHeight: '100vh' }}>
          
          {/* 1. Left Drawer */}
          <Sidebar />

          {/* 2. Main Content Container takes up the rest of the space (flex: 1) */}
          <div style={{ flex: 1, padding: '0', boxSizing: 'border-box' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events" element={<Events />} />
              <Route path="/chat" element={<Chat />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/manage-teams" element={<ProtectedRoute><ManageTeams /></ProtectedRoute>} />
              <Route path="/profile/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            </Routes>
          </div>

        </div>
        {/* MAIN WRAPPER CLOSES HERE */}
      </Router>
    </AuthProvider>
  );
}

export default App;
