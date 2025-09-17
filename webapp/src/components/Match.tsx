import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { getMatchById, getMatchPlayers, deleteMatch, joinMatch, saveMatchPlayers, updateMatchDetails } from '../services/match_service';
import Match from '../types/Match';
import '../css/Match.css';
import { FaPencilAlt, FaEye } from 'react-icons/fa';
import { getSessionUserId } from '../services/user_service';
import MatchEditMode from './MatchEditMode';
import MatchViewMode from './MatchViewMode';


const MatchComponent = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const showDialogParam = searchParams.get('showDialog') === 'true';
    const [match, setMatch] = useState<Match>(new Match(0, 0, 0, '', null, -1, '', false, false));
    const [players, setPlayers] = useState<any[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editMatch, setEditMatch] = useState<Match | null>(null);
    const [editPlayers, setEditPlayers] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        setCurrentUserId(getSessionUserId());
        if (!id) {
            alert('Ha ocurrido un error.');
            navigate('/home');
            return;
        }
        const inviteCode = searchParams.get('inviteCode');
        getMatchById(parseInt(id), inviteCode ? inviteCode : undefined).then(data => {
            setMatch(data);
            if (data.id === undefined || data.id === null) {
                alert('Ha ocurrido un error al intentar acceder al partido. Por favor, inténtalo de nuevo más tarde.');
                navigate('/home');
                return;
            } else {
                getMatchPlayers(data.id).then(playersData => {
                    setPlayers(playersData);
                });
            }
        }).catch(error => {
            if (error.response && error.response.status === 403) {
                setAccessDenied(true);
            } else {
                console.error('Error fetching match:', error);
            }
        });
    }, [id, navigate, searchParams]);

    useEffect(() => {
        if (match) {
            setEditMatch(new Match(
                match.id,
                match.scoreLocal,
                match.scoreAway,
                match.timestamp,
                match.mvp,
                match.creatorId,
                match.location,
                match.finished,
                match.isPublic
            ));
        }
        if (players) {
            setEditPlayers([...players]);
        }
    }, [match, players]);


    const handleGoalUpdate = async (userId: number, goals: number) => {
        setEditPlayers(prev =>
            prev.map(p => p.userId === userId ? { ...p, goals } : p)
        );
    };

    const handlePlayerClick = (playerId: number) => {
        setSelectedPlayerId(playerId);
    };

    const handleSave = async () => {
        try {
            // Save teams
            const validPlayers = editPlayers.filter(p => p.userId !== null && p.userId !== undefined);
            if (validPlayers.length === 0) {
                alert('No hay jugadores válidos para guardar.');
                return;
            }
            if (!editMatch || !editMatch.id) {
                alert('No se ha podido guardar el partido.');
                return;
            }
            const playersSaved = await saveMatchPlayers(editMatch.id, validPlayers);

            // Save match fields (score, date, location, mvp)
            const matchUpdated = await updateMatchDetails(editMatch);

            if (playersSaved && matchUpdated) {
                alert('Datos del partido guardados correctamente.'); setEditMode(false);
                setMatch(new Match(
                    editMatch.id,
                    editMatch.scoreLocal,
                    editMatch.scoreAway,
                    editMatch.timestamp,
                    editMatch.mvp,
                    editMatch.creatorId,
                    editMatch.location,
                    editMatch.finished
                ));
                setPlayers([...editPlayers]);
            } else {
                alert('Error al guardar los datos del partido.');
            }
        } catch (e) {
            alert('Error al guardar los datos del partido.');
        }
    };

    const handleDelete = async () => {
        if (!match) return;

        if (window.confirm('¿Estás seguro de que quieres borrar este partido? Esta acción no se puede deshacer.')) {
            try {
                await deleteMatch(match.id);
                navigate('/home');
            } catch (e) {
                alert('Error al borrar el partido');
            }
        }
    };

    const handleJoin = async () => {
        try {
            const userId = getSessionUserId(); // Replace with session logic if needed
            if (!userId) {
                alert('Usuario no identificado. Por favor, inicia sesión.');
                navigate('/auth');
                return;
            }
            if (!id) {
                alert('Ha ocurrido un error al intentar unirte al partido. Por favor, inténtalo de nuevo más tarde.');
                navigate('/home');
                return;
            }
            const inviteCode = searchParams.get('inviteCode');
            await joinMatch(id, userId, inviteCode ? inviteCode : undefined);
            alert('Te has unido al partido');
            window.location.reload();
        } catch (error) {
            alert('Error al unirte al partido. Por favor, inténtalo de nuevo.');
        }
    };

    useEffect(() => {
    }, [showDialogParam]);


    // Determine if user is a member
    const isMember = players.some(p => p.userId === currentUserId);
    // Show join button if not a member and match is public or accessed via invite
    const inviteCode = searchParams.get('inviteCode');
    const showJoinButton = !isMember && (match.isPublic || !!inviteCode);

    return (
        <div className="match-main-container">
            {match && (
                <div className="match-card" style={{ position: 'relative' }}>
                    <div className="match-topbar">
                        {!editMode && currentUserId === match.creatorId ? (
                            <button
                                className="match-toggle-btn"
                                title="Editar"
                                onClick={() => setEditMode(true)}
                            >
                                <FaPencilAlt />
                            </button>
                        ) : null}
                        {editMode && (
                            <button
                                className="match-toggle-btn view"
                                title="Ver"
                                onClick={() => {
                                    setEditMode(false);
                                    setEditMatch(new Match(
                                        match.id,
                                        match.scoreLocal,
                                        match.scoreAway,
                                        match.timestamp,
                                        match.mvp,
                                        match.creatorId,
                                        match.location,
                                        match.finished,
                                        match.isPublic
                                    ));
                                    setEditPlayers([...players]);
                                }}
                            >
                                <FaEye />
                            </button>
                        )}
                    </div>
                    {!editMode ? (
                        <MatchViewMode match={match} players={players} />
                    ) : (
                        <MatchEditMode
                            editMatch={editMatch}
                            setEditMatch={setEditMatch}
                            editPlayers={editPlayers}
                            setEditPlayers={setEditPlayers}
                            selectedPlayerId={selectedPlayerId}
                            setSelectedPlayerId={setSelectedPlayerId}
                            handlePlayerClick={handlePlayerClick}
                            currentUserId={currentUserId}
                            matchCreatorId={match.creatorId}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            onUpdateGoals={handleGoalUpdate}
                        />
                    )}
                </div>
            )}
            {!match && (
                <Typography variant="body1">Loading match details...</Typography>
            )}
            {/* Show join button at the bottom if not a member and match is public or accessed via invite */}
            {showJoinButton && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleJoin}
                        style={{ background: '#4caf50', color: '#fff', fontWeight: 600, borderRadius: '8px', padding: '0.7em 2em', fontSize: '1.1em' }}
                    >
                        Unirse al partido
                    </Button>
                </div>
            )}
            {accessDenied && !showJoinButton && (
                <Dialog open={accessDenied} onClose={() => navigate('/home')}>
                    <DialogTitle>Acceso Denegado</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            No perteneces a este partido.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => navigate('/home')} color="primary">Aceptar</Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default MatchComponent;