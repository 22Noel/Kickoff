import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import "../css/Home.css";
import { getMatchesForUser, createMatch } from '../services/match_service';
import { getSessionUser } from '../services/user_service';
import MatchCreation from './MatchCreation';
import Match from '../types/Match';
import { InvalidTokenError } from 'jwt-decode';



function Home() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);
    const [creatingMatch, setCreatingMatch] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);


    useEffect(() => {
        async function fetchMatches() {
            const sessionUser = await getSessionUser();
            if (sessionUser) {
                setUserId(sessionUser.id);
                try {
                    const response = await getMatchesForUser(sessionUser.id);
                    console.log('Fetched matches:', response);
                    setMatches(response);
                } catch (error) {
                    if (error instanceof InvalidTokenError) {
                        console.error('Invalid token, redirecting to login:', error);
                        localStorage.removeItem('jwt-token');
                        setUserId(null);
                        navigate('/auth');
                    } else {
                        console.error('Error fetching matches:', error);
                    }
                }
            }
        }
        fetchMatches();
    }, [navigate]);



    const handleCreateMatch = async (date: string, time: string, location: string, isPublic: boolean) => {
        const matchDateDMY = date.split('-').reverse().join('-');
        const dateInput = `${matchDateDMY}T${time}`;
        const isValidDate = !isNaN(Date.parse(matchDateDMY));
        if (!userId) {
            alert("Usuario no cargado. Por favor, vuelve a iniciar sesión.");
            navigate('/auth');
            return;
        }
        if (isValidDate && time.match(/^\d{2}:\d{2}$/)) {
            const createdMatch = await createMatch(dateInput, location, isPublic);
            if (!createdMatch) {
                alert("Error creando el partido. Por favor, inténtalo de nuevo.");
                return;
            } else {
                navigate("/matches/" + createdMatch.id);
            }
        } else {
            console.error("Invalid date or time format. Please enter a valid date and time.");
        }
    };

    return (
        <>
            <Container sx={{
                display: 'flex',
                gap: 2,
                padding: 2,
                marginTop: '80px',
                minHeight: 'calc(100vh - 80px)',
                flexDirection: {
                    xs: 'column', // stack vertically on phones
                    sm: 'row'     // side by side on tablets and up
                }
            }} className="main-container">
                <Container className="match-container"
                    sx={{
                        width: {
                            xs: '100%',  // full width on phones
                            sm: 'auto'   // default width on tablets and up
                        }
                    }}
                >
                    <Typography variant="h6" component="h3" gutterBottom>Siguientes partidos</Typography>
                    <MatchCreation onCreate={handleCreateMatch} creatingMatch={creatingMatch} setCreatingMatch={setCreatingMatch} />
                    {/* Agrupar partidos por fecha y mostrar la fecha encima de cada grupo de partidos, sin contenedor extra */}
                    {(() => {
                        if (!matches || matches.length === 0) return null;
                        // Sort matches by date ascending (closest first) 
                        const sortedMatches = [...matches].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        const matchesByDate: Record<string, Match[]> = {};
                        sortedMatches.forEach((matchObj) => {
                            const dateObj: Date = new Date(matchObj.timestamp);
                            const dateKey: string = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                            if (!matchesByDate[dateKey]) matchesByDate[dateKey] = [] as Match[];
                            matchesByDate[dateKey].push(matchObj);
                        });
                        return Object.entries(matchesByDate).map(([date, matchesForDate]: [string, Match[]]) => ([
                            <Typography key={date} className="date-typography">{date.charAt(0).toUpperCase() + date.slice(1)}</Typography>,
                            ...matchesForDate.map((matchObj: Match, idx: number) => (
                                <Container
                                    key={date + '-' + idx}
                                    sx={{ marginBottom: 1, boxShadow: 'none', padding: 2, cursor: 'pointer', background: '#232323', borderRadius: 2 }}
                                    onClick={() => navigate("/matches/" + matchObj.id)} className="match-item">
                                    {matchObj.finished == false ? (
                                        <>
                                            <span className="timestamp-typography">
                                                {new Date(matchObj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                            <Typography variant="body1" component="span">
                                                📍 {matchObj.location || 'N/A'}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body1" component="div">
                                            {matchObj.scoreLocal} - {matchObj.scoreAway} ubicación: {matchObj.location || 'N/A'}
                                        </Typography>
                                    )}
                                </Container>
                            ))
                        ]));
                    })()}

                </Container>
            </Container>
        </>
    );
}

export default Home;