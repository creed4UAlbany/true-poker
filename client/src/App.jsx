// client/src/App.jsx
import { API_URL } from './config';
import { useState, useEffect } from 'react';
import useSWR from 'swr'; // Import SWR
import axios from 'axios';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import PokerTable from './components/PokerTable';
import './App.css';

// The "Fetcher" function tells SWR how to get data (using axios)
const fetcher = url => axios.get(url).then(res => res.data);

function App() {
  // We track the generic Firebase session
  const [firebaseUser, setFirebaseUser] = useState(null);

  // 1. Auth Listener: Handles Login/Logout events
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setFirebaseUser(currentUser);
      
      // If user just logged in, trigger the "Create/Login" POST to backend
      if (currentUser) {
        try {
            await axios.post(`${API_URL}/api/auth/login`, {
                googleId: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL
            });
        } catch (error) {
            console.error("Login Sync Error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. useSWR: Handles Data Sync (Chips, Name, Avatar)
  // Logic: If we have a firebaseUser, fetch their data. If not, fetch nothing (null).
  const { data: currentUser, error } = useSWR(
    firebaseUser ? `${API_URL}/api/users/${firebaseUser.uid}` : null, 
    fetcher,
    { refreshInterval: 1000 } // Poll every 1 second for real-time chip updates
  );

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Login failed:", error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
  };

  // Simple Loading State
  if (firebaseUser && !currentUser) return <div>Loading Profile...</div>;

  return (
    <div className="app-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>True Poker ♠️</h1>

      {currentUser ? (
        // --- LOGGED IN VIEW ---
        <div style={{ width: '800px', margin: '0 auto' }}>
          <PokerTable user={currentUser} />
          <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px' }}>
            Sign Out
          </button>
        </div>
      ) : (
        // --- LOGGED OUT VIEW ---
        <div className="login-card">
          <p>Please log in to save your chips and stats.</p>
          <button 
            onClick={handleLogin} 
            style={{ 
              padding: '15px 30px', 
              fontSize: '1.2em', 
              cursor: 'pointer', 
              backgroundColor: '#4285F4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}

export default App;