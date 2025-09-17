import '../css/MatchCreation.css';
import React, { useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Typography } from '@mui/material';

interface MatchCreationProps {
  onCreate: (date: string, time: string, location: string, isPublic: boolean) => void;
  creatingMatch: boolean;
  setCreatingMatch: (val: boolean) => void;
}

const MatchCreation: React.FC<MatchCreationProps> = ({ onCreate, creatingMatch, setCreatingMatch }) => {
  const [matchDate, setMatchDate] = useState<Date | null>(null);
  const [matchTime, setMatchTime] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = () => {
    let dateString = '';
    if (matchDate instanceof Date && !isNaN(matchDate.getTime())) {
      const yyyy = matchDate.getFullYear();
      const mm = String(matchDate.getMonth() + 1).padStart(2, '0');
      const dd = String(matchDate.getDate()).padStart(2, '0');
      dateString = `${dd}-${mm}-${yyyy}`;
    }
    onCreate(dateString, matchTime, location, isPublic);
  };

  return (
    <Container className="match-creation-container">
      <Button onClick={() => setCreatingMatch(!creatingMatch)} variant="contained">Crear un partido</Button>
      {creatingMatch && (
        <Container className="match-creation-container">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              className="match-creation-textfield"
              value={matchDate ? matchDate.toISOString().slice(0, 10) : ''}
              onChange={e => {
                const [y, m, d] = e.target.value.split('-');
                const date = new Date(Number(y), Number(m) - 1, Number(d));
                setMatchDate(date);
              }}
            />
            <input
              type="time"
              className="match-creation-textfield"
              value={matchTime}
              onChange={e => setMatchTime(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Lugar"
            className="match-creation-textfield"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <FormControlLabel
        control={
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Partido público
              </Typography>
            }
          />
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Crear
          </Button>
        </Container>
      )}
    </Container>
  );
};

export default MatchCreation;
