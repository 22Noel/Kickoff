
export interface Player {
    userId: number; // Changed from id to match the API
    username: string;
    goals: number;
    team: string;
}

export default class Match {    
    id: number;
    scoreLocal: number = 0;
    scoreAway: number = 0;
    timestamp: string;
    mvp: string | null = null;
    players: Player[] = [];
    creatorId: number;
    location: string = '';
    finished: boolean = false;
    isPublic: boolean = false;

    constructor(id: number, scoreLocal: number, scoreAway: number, timestamp: string, mvp: string | null, creatorId: number, location: string, finished: boolean = false, isPublic: boolean = false) {
        this.id = id;
        this.scoreLocal = scoreLocal;
        this.scoreAway = scoreAway;
        this.timestamp = timestamp;
        this.mvp = mvp;
        this.creatorId = creatorId;
        this.location = location;
        this.finished = finished;
        this.isPublic = isPublic;
    }

    getFormattedDate(): string {
        const date = new Date(this.timestamp);
        return date.toLocaleString();
    }

    addPlayer(player: Player): void {
        if (!this.players) {
            this.players = [];
        }
        if(!this.players.includes(player)) {
            this.players.push(player);
        }
    }

    removePlayer(player: Player): void {
        if (this.players) {
            this.players = this.players.filter(p => p !== player);
        }
    }


}

