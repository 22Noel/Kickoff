import { Container, Box, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getSessionUserId } from "../services/user_service";
import { useNavigate } from "react-router-dom";
import { getPlayerStats } from "../services/match_service";

function Career() {

    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalMatches: 0,
        wins: 0,
        losses: 0,
        goalsScored: 0,
        mvps: 0
    });

    useEffect(() => {
            getPlayerStats(getSessionUserId()).then(data => setStats(data));
        }, [navigate]);
    return (
        <Container className="profile-container">


                <Typography variant="h5" component="h3" gutterBottom>Carrera</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Box className="profile-stat-item">
                            <Typography variant="h6" className="profile-stat-value">{stats.totalMatches}</Typography>
                            <Typography variant="body2">Partidos jugados</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box className="profile-stat-item">
                            <Typography variant="h6" className="profile-stat-value">{stats.wins}</Typography>
                            <Typography variant="body2">Partidos ganados</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box className="profile-stat-item">
                            <Typography variant="h6" className="profile-stat-value">{stats.losses}</Typography>
                            <Typography variant="body2">Partidos perdidos</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box className="profile-stat-item">
                            <Typography variant="h6" className="profile-stat-value">{stats.goalsScored}</Typography>
                            <Typography variant="body2">Goles marcados</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box className="profile-stat-item">
                            <Typography variant="h6" className="profile-stat-value">{stats.mvps}</Typography>
                            <Typography variant="body2">MVPs</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
    );
}

export default Career;