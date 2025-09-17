import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatchByInviteCode } from '../services/match_service';

const MatchRedirect = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMatchId = async () => {
            try {
                if (!code) {
                    alert('No invite code provided.');
                    navigate('/');
                    return;
                } else {
                    const match = await getMatchByInviteCode(code);
                    if (match && match.id) {
                        navigate(`/matches/${match.id}?showDialog=true`);
                    } else {
                        alert('Invalid invite code.');
                        navigate('/');
                    }
                }

            } catch (error) {
                console.error('Error fetching match by invite code:', error);
                alert('Failed to load match. Please try again.');
                navigate('/');
            }
        };

        if (code) {
            fetchMatchId();
        }
    }, [code, navigate]);

    return <div>Loading match...</div>;
};

export default MatchRedirect;
