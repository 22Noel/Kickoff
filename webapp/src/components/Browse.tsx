import { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import Match from "../types/Match";
import { useNavigate } from "react-router-dom";
import { fetchMatches } from "../services/match_service";

function Browse() {
    const [matches, setMatches] = useState<Match[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatches().then(data => setMatches(data));
    }, []);

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
                    <Typography variant="h5" component="h3" gutterBottom>Lista de partidos</Typography>
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

export default Browse;
