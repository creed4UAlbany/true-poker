import { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';

// Your Giphy Key
const GIPHY_API_KEY = 'HOFIMSwLwJ13BoSzX0xgmq80bLEZbiwm';

const fetcher = url => axios.get(url).then(res => res.data);

const WinnerOverlay = ({ winner, onClose }) => {
    const tag = winner === 'player' ? 'poker winner' : 'sad fail';

    // --- FIX: Use "Lazy Initialization" (() => ...) ---
    // This prevents Date.now() from running on every render
    const [timestamp] = useState(() => Date.now()); 
    
    const { data, error, isLoading } = useSWR(
        // The URL uses the STABLE 'timestamp' variable
        winner ? `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${tag}&rating=g&ts=${timestamp}` : null,
        fetcher,
        { 
            revalidateOnFocus: false, 
            shouldRetryOnError: false 
        }
    );

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const gifUrl = data?.data?.images?.original?.url;

    return (
        <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -20%)',
            width: '80%', maxWidth: '500px',
            backgroundColor: 'rgba(0,0,0,0.9)', color: 'white',
            borderRadius: '20px', padding: '20px',
            zIndex: 1000, textAlign: 'center',
            boxShadow: '0 0 50px gold', border: '2px solid gold'
        }}>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 20px 0', fontFamily: 'serif' }}>
                {winner === 'player' ? 'YOU WON THE POT!' : 'BETTER LUCK NEXT TIME'}
            </h2>

            {isLoading && <p>Finding celebration...</p>}
            
            {/* Show error if Giphy blocked us (429) */}
            {error && <div style={{ fontSize: '1rem', color: 'red' }}>API Limit Reached (Wait 1 hr)</div>}

            {!isLoading && gifUrl && (
                <img src={gifUrl} alt="Victory" style={{ width: '100%', borderRadius: '10px' }} />
            )}

            {/* Fallback if no GIF found */}
            {!isLoading && !gifUrl && !error && <div style={{ fontSize: '4rem' }}>🏆</div>}

            <button 
                onClick={onClose}
                style={{
                    marginTop: '20px', padding: '10px 30px',
                    fontSize: '1.2rem', cursor: 'pointer',
                    background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px'
                }}
            >
                CLOSE
            </button>
        </div>
    );
};

export default WinnerOverlay;