import React from 'react';
import { createInviteLink, saveMatchPlayers, updateMatchDetails, deleteMatch } from '../services/match_service';
import '../css/MatchEdit.css';
import Match from '../types/Match';

interface Player {
  userId: number;
  username: string;
  goals: number;
  team: string;
}

interface Props {
  editMatch: Match | null;
  setEditMatch: (match: Match | null) => void;
  editPlayers: Player[];
  setEditPlayers: (players: Player[]) => void;
  selectedPlayerId: number | null;
  setSelectedPlayerId: (id: number | null) => void;
  handlePlayerClick: (id: number) => void;
  currentUserId: number | null;
  matchCreatorId: number;
  onSave: () => void;
  onDelete: () => void;
  onUpdateGoals: (userId: number, goals: number) => void;
}

interface PlayerItemProps {
  player: Player;
  onClick: () => void;
  selected: boolean;
}

const MatchEditMode = ({
  editMatch,
  setEditMatch,
  editPlayers,
  setEditPlayers,
  selectedPlayerId,
  setSelectedPlayerId,
  handlePlayerClick,
  currentUserId,
  matchCreatorId,
  onSave,
  onDelete,
  onUpdateGoals
}: Props) => {
  const PlayerItem = ({ player, onClick, selected }: PlayerItemProps) => (
    <li className={`match-player-item${selected ? ' selected' : ''}`}>
      <button
        type="button"
        className="player-button"
        onClick={onClick}
      >
        <span>{player.username}</span>
        <PlayerGoalsDisplay player={player} />
      </button>
    </li>
  );

  const PlayerGoalsDisplay = ({ player }: { player: Player }) => (
    <div className="player-goals-display">
      <button
        type="button"
        className="goals-button"
        onClick={(e) => {
          e.stopPropagation();
          onUpdateGoals(player.userId, Math.max(0, (player.goals || 0) - 1));
        }}
      >
        -
      </button>
      <span className="goals-display">
        <span role="img" aria-label="fútbol">⚽</span> {player.goals ?? 0}
      </span>
      <button

        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: '#4caf50',
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '32px',
          minHeight: '32px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateGoals(player.userId, (player.goals || 0) + 1);
        }}
      >
        +
      </button>
    </div>
  );

  const handleTeamClick = (team: string) => {
    if (selectedPlayerId !== null) {
      // Find the current player's team
      const currentPlayer = editPlayers.find(p => p.userId === selectedPlayerId);
      // If player is already in this team, remove them from team
      if (currentPlayer && currentPlayer.team === team) {
        setEditPlayers(editPlayers.map(p =>
          p.userId === selectedPlayerId ? { ...p, team: '' } : p
        ));
      } else {
        // Otherwise assign to new team
        setEditPlayers(editPlayers.map(p =>
          p.userId === selectedPlayerId ? { ...p, team } : p
        ));
      }
      setSelectedPlayerId(null);
    }
  };

  const updateMatch = (partialMatch: Partial<Match>) => {
    if (!editMatch) return;
    setEditMatch(new Match(
      editMatch.id,
      partialMatch.scoreLocal ?? editMatch.scoreLocal,
      partialMatch.scoreAway ?? editMatch.scoreAway,
      partialMatch.timestamp ?? editMatch.timestamp,
      partialMatch.mvp ?? editMatch.mvp,
      editMatch.creatorId,
      partialMatch.location ?? editMatch.location,
      partialMatch.finished ?? editMatch.finished
    ));
  };

  const handleSave = async () => {
    try {
      const validPlayers = editPlayers.filter(p => p.userId !== null && p.userId !== undefined); if (!editMatch?.id) {
        throw new Error('Match ID is required');
      }
      const playersSaved = await saveMatchPlayers(editMatch.id, validPlayers);
      const matchUpdated = await updateMatchDetails(editMatch);

      if (playersSaved && matchUpdated) {
        alert('Datos del partido guardados correctamente.');
        onSave();
      } else {
        alert('Error al guardar los datos del partido.');
      }
    } catch (e) {
      alert('Error al guardar los datos del partido.');
    }
  };

  const handleDelete = async () => {
    if (!editMatch) return;

    if (window.confirm('¿Estás seguro de que quieres borrar este partido? Esta acción no se puede deshacer.')) {
      try {
        await deleteMatch(editMatch.id);
        onDelete();
      } catch (e) {
        alert('Error al borrar el partido');
      }
    }
  };

  return (
    <div>
      <div className="score-container">
        <input
          type="number"
          value={editMatch?.scoreLocal ?? ''}
          className="score-input"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMatch({ scoreLocal: Number(e.target.value) })}
        />
        <span style={{ fontWeight: 700, fontSize: '2.5rem', color: '#4caf50' }}>-</span>
        <input
          type="number"
          value={editMatch?.scoreAway ?? ''}
          className="score-input"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMatch({ scoreAway: Number(e.target.value) })}
        />
      </div>

      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
        <div className="time-container">
          <div className="time-input-group">
            <span role="img" aria-label="clock">🕓</span>
            <input
              type="time"
              className="match-time-input"
              value={editMatch ? new Date(editMatch.timestamp).toISOString().slice(11, 16) : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!editMatch) return;
                const date = new Date(editMatch.timestamp);
                const [h, m] = e.target.value.split(":");
                date.setHours(Number(h));
                date.setMinutes(Number(m));
                updateMatch({ timestamp: date.toISOString() });
              }}
            />
          </div>
          <input
            type="date"
            className="match-time-input"
            value={editMatch ? new Date(editMatch.timestamp).toISOString().slice(0, 10) : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!editMatch) return;
              const date = new Date(editMatch.timestamp);
              const [y, m, d] = e.target.value.split("-");
              date.setFullYear(Number(y));
              date.setMonth(Number(m) - 1);
              date.setDate(Number(d));
              updateMatch({ timestamp: date.toISOString() });
            }}
          />
        </div>

        <div className="location-container">
          <div className="location-input-group">
            <span role="img" aria-label="location" className="match-location-icon">📍</span>
            <input
              type="text"
              className="match-location-input"
              value={editMatch?.location || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMatch({ location: e.target.value })}
              placeholder="Ubicación del partido"
            />
          </div>
        </div>
        <div className="mvp-container">
          <div className="mvp-input-group">
            <span role="img" aria-label="star" className="mvp-icon">⭐</span>
            <select
              className="mvp-select"
              value={editMatch?.mvp || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateMatch({ mvp: e.target.value })}
            >
              <option value="">Sin MVP</option>
              {editPlayers.map((player) => (
                <option key={player.userId} value={player.userId}>{player.username}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="action-buttons-container">
        <button
          className="game-button shuffle-button"
          onClick={() => {
            if (!editPlayers || editPlayers.length === 0) return;
            const shuffled = [...editPlayers].sort(() => Math.random() - 0.5);
            const half = Math.ceil(shuffled.length / 2);
            const updated = shuffled.map((p: Player, idx: number) => ({ ...p, team: idx < half ? 'A' : 'B' }));
            setEditPlayers(updated);
          }}
        >
          Mezclar equipos
        </button>
        <button
          className="game-button share-button"
          onClick={async () => {
            if (!editMatch?.id) return;
            try {
              const inviteData = await createInviteLink(editMatch.id);
              const url = inviteData.url;
              window.prompt('Link de invitación (válido por 24 horas):', url);
            } catch (error) {
              alert('Error al crear el link de invitación. Por favor, inténtalo de nuevo.');
              console.error(error);
            }
          }}
        >
          <span role="img" aria-label="share">📤</span> Invitar jugadores
        </button>
      </div>
      <div className="teams-container">
        <button
          className={`no-team-header${selectedPlayerId !== null ? ' selectable' : ''}`}
          onClick={() => selectedPlayerId !== null && handleTeamClick('')}
          disabled={selectedPlayerId === null}
        >
          {selectedPlayerId !== null ? '→ Sin equipo' : 'Sin equipo'}
        </button>
        <ul className="match-players-list">
          {editPlayers.filter(p => !p.team || p.team === '').length > 0 ? (
            editPlayers.filter(p => !p.team || p.team === '').map((player, idx) => (
              <PlayerItem
                key={`no-team-${idx}`}
                player={player}
                onClick={() => handlePlayerClick(player.userId)}
                selected={selectedPlayerId === player.userId}
              />
            ))
          ) : (
            <li className="match-player-empty">No hay jugadores sin equipo.</li>
          )}
        </ul>

        <div className="teams-grid">
          {['A', 'B'].map(team => (
            <div key={team} style={{ width: '100%' }}>              <button
              className={`team-header${selectedPlayerId !== null ? ' selectable' : ''}`}
              onClick={() => selectedPlayerId !== null && handleTeamClick(team)}
              disabled={selectedPlayerId === null}
            >
              {selectedPlayerId !== null ? `→ Equipo ${team}` : `Equipo ${team}`}
            </button>
              <ul className="match-players-list">
                {editPlayers.filter(p => p.team === team).length > 0 ? (
                  editPlayers.filter(p => p.team === team).map((player, idx) => (
                    <PlayerItem
                      key={`${team}-${idx}`}
                      player={player}
                      onClick={() => handlePlayerClick(player.userId)}
                      selected={selectedPlayerId === player.userId}
                    />
                  ))
                ) : (
                  <li className="match-player-empty">No hay jugadores en este equipo.</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="finished-container">
        <label className="finished-label">
          <input
            type="checkbox"
            checked={editMatch?.finished || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMatch({ finished: e.target.checked })}
          />
          Partido finalizado
        </label>
      </div>
      <div className="action-buttons-container">
        <button
          className="game-button save-button"
          onClick={handleSave}
        >
          Guardar cambios
        </button>
        {currentUserId === matchCreatorId && (
          <button
            className="game-button delete-button"
            onClick={handleDelete}
          >
            Borrar partido
          </button>
        )}
      </div>

    </div>
  );
};

export default MatchEditMode;
