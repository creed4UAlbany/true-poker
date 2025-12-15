import { API_URL } from '../config';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';
import axios from 'axios'; 
import { Deck } from '../game/Deck';
import { getHandRank, determineWinner } from '../game/HandEvaluator';
import WinnerOverlay from './WinnerOverlay';
import { motion } from 'framer-motion';

// --- Card Component (Unchanged) ---
const Card = ({ card, hidden }) => (
  <motion.div 
    initial={{ scale: 0, rotateY: 180 }}
    animate={{ scale: 1, rotateY: 0 }}
    style={{
      width: '60px', height: '90px',
      backgroundColor: hidden ? '#b71540' : 'white',
      backgroundImage: hidden ? 'repeating-linear-gradient(45deg, #b71540 0, #b71540 10px, #e55039 10px, #e55039 20px)' : 'none',
      borderRadius: '5px',
      border: '1px solid #ccc',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      margin: '5px',
      color: card?.color,
      fontSize: '1.5em',
      fontWeight: 'bold',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.3)'
    }}
  >
    {!hidden && <div>{card.value}</div>}
    {!hidden && <div>{card.suit}</div>}
  </motion.div>
);

const PokerTable = ({ user }) => {
  const [deck] = useState(new Deck());
  const [hand, setHand] = useState([]);
  const [cpuHand, setCpuHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [stage, setStage] = useState('new');
  const [message, setMessage] = useState("Click Deal to Start");
  const [pot, setPot] = useState(0);
  
  // State for the Celebration Overlay
  const [showCelebration, setShowCelebration] = useState(false);
  const [winnerType, setWinnerType] = useState(null); 

  const updateChips = async (amount) => {
    try {
        await axios.post(`${API_URL}/api/users/${user.googleId}/transaction`, {
            amount: amount
        });
    } catch (error) {
        console.error("Transaction failed:", error);
    }
  };

  const handleGameAction = async () => {
    // --- FIX: Close the GIF immediately if user clicks the button ---
    setShowCelebration(false);

    switch (stage) {
      case 'new':
      case 'showdown':
        if (user.chips < 50) {
            setMessage("You are broke! (Refill coming soon)");
            return;
        }
        await updateChips(-50);
        deck.reset();
        deck.shuffle();
        setHand([deck.deal(), deck.deal()]);
        setCpuHand([deck.deal(), deck.deal()]);
        setCommunityCards([]);
        setStage('preflop');
        setPot(100); 
        setMessage("Anting up $50... Good Luck!");
        break;

      case 'preflop':
        setCommunityCards([deck.deal(), deck.deal(), deck.deal()]);
        setStage('flop');
        setMessage("The Flop");
        break;

      case 'flop':
        setCommunityCards([...communityCards, deck.deal()]);
        setStage('turn');
        setMessage("The Turn");
        break;

      case 'turn': {
        const riverCard = deck.deal();
        const fullBoard = [...communityCards, riverCard];
        setCommunityCards(fullBoard);
        setStage('river');
        setMessage("The River... Final Bet!");
        break;
      }

      case 'river': {
        const winner = determineWinner(hand, cpuHand, communityCards);
        
        console.log("🔍 DEBUG: Winner is ->", winner);

        const playerRank = getHandRank(hand, communityCards);
        const cpuRank = getHandRank(cpuHand, communityCards);

        setStage('showdown');
        
        if (winner === 'player') {
            setMessage(`YOU WIN $${pot}! (${playerRank.description})`);
            await updateChips(100); 
            console.log("🔍 DEBUG: Setting Player Celebration");
            setWinnerType('player');
            setShowCelebration(true);

        } else if (winner === 'cpu') {
            setMessage(`YOU LOSE. CPU has ${cpuRank.description}`);
            console.log("🔍 DEBUG: Setting CPU Celebration");
            setWinnerType('cpu');
            setShowCelebration(true);

        } else {
            console.log("🔍 DEBUG: It's a Tie (No celebration)");
            setMessage("It's a Tie! Split the pot.");
            await updateChips(50);
        }
        break;
      }

      default:
        break;
    }
  };

  const handleReset = async () => {
    if (window.confirm("Run out of luck? Reset to $1000?")) {
        await axios.put(`${API_URL}/api/users/${user.googleId}/reset`);
        setMessage("Chips reset! Try again.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This will delete your account and chips forever.")) {
        await axios.delete(`${API_URL}/api/users/${user.googleId}`);
        await signOut(auth); 
        window.location.reload(); 
    }
  };

  return (
    <div style={{
      boxSizing: 'border-box',
      backgroundColor: '#35654d',
      width: '100%', minHeight: '600px',
      borderRadius: '20px', border: '15px solid #4a3c31',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '40px', color: 'white',
      position: 'relative' 
    }}>
      
      {showCelebration && (
        <WinnerOverlay 
            winner={winnerType} 
            onClose={() => setShowCelebration(false)} 
        />
      )}

      {/* CPU Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ opacity: 0.8, marginBottom: '5px' }}>CPU Opponent</div>
        <div style={{ display: 'flex' }}>
            {stage === 'showdown' 
                ? cpuHand.map((c, i) => <Card key={i} card={c} />)
                : <><Card hidden /> <Card hidden /></>
            }
        </div>
      </div>

      {/* Board & Pot */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5em', color: 'gold', marginBottom: '10px', textShadow: '0 0 10px #000' }}>
            Pot: ${pot}
        </div>
        <div style={{ 
            display: 'flex', height: '100px', padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '50px', minWidth: '350px', justifyContent: 'center'
        }}>
            {communityCards.map((card, i) => <Card key={i} card={card} />)}
        </div>
      </div>

      {/* Message */}
      <h2 style={{ textShadow: '2px 2px 4px black', height: '30px' }}>{message}</h2>

      {/* Player Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          {hand.map((card, i) => <Card key={i} card={card} />)}
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '15px',
          background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '30px'
        }}>
          <img src={user.avatar} style={{ width: '40px', borderRadius: '50%', border: '2px solid gold' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{user.displayName}</div>
            <div style={{ color: '#FFD700' }}>Chips: {user.chips}</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <button 
        onClick={handleGameAction}
        style={{
          marginTop: '20px', padding: '15px 50px', fontSize: '1.5em',
          cursor: 'pointer',
          background: stage === 'showdown' ? '#ff4757' : '#ffa502',
          color: 'white', border: 'none', borderRadius: '50px',
          boxShadow: '0 5px 0 #b87501'
        }}
      >
        {/* Button Text Logic */}
        {stage === 'new' || stage === 'showdown' 
            ? 'DEAL ($50)' 
            : stage === 'river' 
                ? 'REVEAL WINNER!' 
                : 'NEXT CARD'
        }
      </button>

      {/* GAME CONTROLS */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        {user.chips < 50 && (
          <button 
            onClick={handleReset}
            style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            🆘 Bankrupt! Reset Chips
          </button>
        )}
        <button 
          onClick={handleDelete}
          style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default PokerTable;