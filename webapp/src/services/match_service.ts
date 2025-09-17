import axios from 'axios';
import Match, { Player } from '../types/Match'; 

let VITE_API_URL: string = 'http://localhost:3000/api';
let VITE_DEBUG: boolean = import.meta.env.VITE_ENV === 'development';

if(import.meta.env.VITE_ENV == 'production') {
    console.log("Using production environment for match service");
    VITE_API_URL = import.meta.env.VITE_API_URL;
    VITE_DEBUG = false;
} else {
    console.log("Using development environment for match service");
}

export function getMatchById(id: number, inviteCode?: string): Promise<Match> {
    const params: any = {};
    if (inviteCode) params.inviteCode = inviteCode;
    return axios.get(`${VITE_API_URL}/matches/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
        params,
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching match by ID:", error);
            throw error;
        });
}

export function getMatchesForUser(userId: number): Promise<Match[]> {
    return axios.get(`${VITE_API_URL}/matches/user/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching matches:", error);
            throw error;
        });
}

export function getPlayerStats(playerId: number) {
    return axios.get(`${VITE_API_URL}/matches/stats/${playerId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    }).then(response => response.data)
    .catch(error => {
        console.error("Error fetching player stats:", error);
        throw error;
    });
}

export function createMatch(timestamp: string, location: string, isPublic: boolean) {
    if(VITE_DEBUG) {
        console.log("Create match request: ", timestamp);
    }

    return axios.post(`${VITE_API_URL}/matches/create`, {
        timestamp: timestamp,
        location: location,
        isPublic: isPublic
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    }).then(response => response.data)
    .catch(error => {
        console.error("Error creating match:", error);
        throw error;
    });
}

export function getMatchPlayers(matchId: number) {
    return axios.get(`${VITE_API_URL}/matches/${matchId}/players`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching match players:", error);
            throw error;
        });
}

export function deleteMatch(matchId: number) {
    return axios.post(`${VITE_API_URL}/matches/delete`, {
        id: matchId
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    }).then(response => {
        if (response.status === 204) {
            return true;
        }
        throw new Error('Failed to delete match');
    })
    .catch(error => {
        console.error("Error deleting match:", error);
        throw error;
    });
}

export function createInviteLink(matchId: number) {
    return axios.get(`${VITE_API_URL}/matches/${matchId}/invite`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error creating invite link:", error);
            throw error;
        });
}

export function joinMatch(matchId: string, userId: number, inviteCode?: string) {
    return axios.post(`${VITE_API_URL}/matches/join/${matchId}`, { userId, inviteCode }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
        },
    })
        .then(response => response.data)
        .catch(error => {
            console.error("Error joining match:", error);
            throw error;
        });
}

export function getMatchDetailsByCode(code: string) {
    return axios.get(`${VITE_API_URL}/matches/invite/${code}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error fetching match details:", error);
            throw error;
        });
}

export async function saveMatchPlayers(matchId: number, players: Player[]) {
    // Filter out players without a valid userId
    const validPlayers = players.filter(p => p && p.userId && typeof p.userId === 'number');
    const payload = {
        matchId,
        players: validPlayers.map(p => ({ 
            playerId: p.userId, 
            team: p.team || '', // Ensure team is never undefined
            goals: p.goals || 0
        }))
    };
    console.log('Saving players payload:', payload);
    const response = await fetch(`${VITE_API_URL}/matches/players/bulk-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
         },
        body: JSON.stringify(payload)
    });
    return response.ok;
}

export async function updateMatchDetails(editMatch: Match) {
    const response = await fetch(`${VITE_API_URL}/matches/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwt-token') || '',
         },
        body: JSON.stringify({
            id: editMatch.id,            
            scoreLocal: editMatch.scoreLocal,
            scoreAway: editMatch.scoreAway,            
            timestamp: editMatch.timestamp,
            mvp: editMatch.mvp,
            location: editMatch.location || '',
            finished: editMatch.finished
        })
    });
    return response.ok;
}

export async function getMatchByInviteCode(code: string) {
    try {
        const response = await fetch(`${VITE_API_URL}/matches/invite/${code}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwt-token') || '',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch match by invite code');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching match by invite code:', error);
        throw error;
    }
}

export async function updatePlayerGoals(userId: number, matchId: number, goals: number) {
    return axios.post(`${VITE_API_URL}/plays/update`, {
        userId,
        matchId,
        goals
    }, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => response.data)
    .catch(error => {
        console.error("Error updating player goals:", error);
        throw error;
    });
}

export async function fetchMatches(): Promise<Match[]> {
    const response = await fetch(`${VITE_API_URL}/matches/`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jwt-token') || '',
        }
    });
    if (!response.ok || response.status === 304) {
        // 304 means no new data, so return empty array or handle as needed
        return [];
    }
    
    const data = await response.json();
    return data;
}