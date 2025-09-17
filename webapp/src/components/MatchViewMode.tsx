import '../css/MatchView.css';
import Match from '../types/Match';

interface Player {
  userId: number;
  username: string;
  goals: number;
  team: string;
}

interface MatchViewModeProps {
  match: Match;
  players: Player[];
}

const MatchViewMode = ({ match, players }: MatchViewModeProps) => (
  <div className="match-view-container">
    <div className="match-info">
      <div className="match-score">
        {match.scoreLocal} - {match.scoreAway}
      </div>
      <div className="match-time">
        <span role="img" aria-label="clock">🕓</span>
        <span className="match-time-value">          {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          {" | "}
          {new Date(match.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="match-location">
        <span role="img" aria-label="location" className="match-location-icon">📍</span>
        <span>{match.location || 'N/A'}</span>
      </div>
      <div className="match-players-container">
        <div className="match-players-title">
          Jugadores
        </div>
        <div className="teams-grid">
          {['A', 'B'].map(team => (
            <div key={team}>
              <div className={`team-header${players.filter(p => p.team === team).length === 0 ? ' no-team-header' : ''}`}>
                Equipo {team}
              </div>
              <ul className="match-players-list">
                {players.filter(p => p.team === team).length > 0 ? (
                  players.filter(p => p.team === team).map((player, idx) => (
                    <li key={team + '-' + idx} className="match-player-item">                      <span>
                        {player.username}
                        {String(player.userId) === String(match.mvp) || player.username === match.mvp ? 
                          <span role="img" aria-label="star" className="player-name-mvp">⭐</span> : null}
                      </span>
                      <span className="player-goals">
                        <span role="img" aria-label="fútbol">⚽</span> {player.goals ?? 0}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="match-player-empty">
                    No hay jugadores en este equipo.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="no-team-section">
          <div className="no-team-header">
            Sin equipo
          </div>
          <ul className="match-players-list">
            {players.filter(p => !p.team || p.team === '').length > 0 ? (
              players.filter(p => !p.team || p.team === '').map((player, idx) => (
                <li key={'no-team-' + idx} className="match-player-item">
                  <span className="player-name">
                    {player.username}
                    {String(player.userId) === String(match.mvp) ? 
                      <span role="img" aria-label="star" className="player-mvp">⭐</span> : null}
                  </span>
                  <span className="player-goals">
                    <span role="img" aria-label="fútbol">⚽</span> {player.goals ?? 0}
                  </span>
                </li>
              ))
            ) : (
              <li className="match-player-empty">
                No hay jugadores sin equipo.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default MatchViewMode;
