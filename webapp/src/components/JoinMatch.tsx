import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionUserId } from '../services/user_service';
import { getMatchByInviteCode } from '../services/match_service';

const JoinMatch = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const sessionUserId = getSessionUserId();
        if (sessionUserId == -1) {
            localStorage.setItem('redirectUrl', window.location.pathname);
            navigate('/auth');
            return;
        }
        const fetchMatchDetails = async () => {
            try {
                if (!code) {
                    alert('Código de invitación no proporcionado.');
                    navigate('/');
                    return;
                }
                const match = await getMatchByInviteCode(code);
                if (match && match.id) {
                    navigate(`/matches/${match.id}?showDialog=true&inviteCode=${code}`);
                } else {
                    alert('Invitación inválida o partido no encontrado.');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching match details:', error);
                alert('Invitación inválida o partido no encontrado.');
                navigate('/');
            }
        };
        fetchMatchDetails();
    }, [code, navigate]);

    return <div>Redirigiendo al partido...</div>;
};

export default JoinMatch;