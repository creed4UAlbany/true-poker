import { Hand } from 'pokersolver';

// Helper: Converts our pretty cards {value: '10', suit: '♥️'} 
// to the format the library wants: "Th" (Ten of Hearts)
const convertCard = (card) => {
    let v = card.value;
    let s = card.suit;

    // 1. Convert Value (10 becomes T)
    if (v === '10') v = 'T';

    // 2. Convert Suit (Symbol becomes letter)
    if (s === '♠️') s = 's';
    else if (s === '♣️') s = 'c';
    else if (s === '♥️') s = 'h';
    else if (s === '♦️') s = 'd';

    return v + s; // Returns "Th" or "As"
};

export const getHandRank = (holeCards, communityCards) => {
    // Combine all 7 cards (2 in hand + 5 on table)
    const allCards = [...holeCards, ...communityCards];
    
    // Convert them to "solver" format
    const solverArray = allCards.map(convertCard);
    
    // Calculate the best hand
    const solvedHand = Hand.solve(solverArray);
    
    return {
        rank: solvedHand.name,       // e.g., "Full House", "Two Pair"
        description: solvedHand.descr // e.g., "Full House, Kings over Tens"
    };
};

export const determineWinner = (playerHole, cpuHole, communityCards) => {
    const playerString = [...playerHole, ...communityCards].map(convertCard);
    const cpuString = [...cpuHole, ...communityCards].map(convertCard);

    const playerHand = Hand.solve(playerString);
    const cpuHand = Hand.solve(cpuString);

    const winners = Hand.winners([playerHand, cpuHand]);

    if (winners.length > 1) return "tie";
    if (winners[0] === playerHand) return "player";
    return "cpu";
};