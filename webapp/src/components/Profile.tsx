import { Container, Typography, TextField, Button } from '@mui/material';
import '../css/Profile.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUserId, getSessionUser, updateUserInfo, updateUserPassword} from '../services/user_service.ts';


function Profile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwt-token');
        navigate('/auth');
    };

    useEffect(() => {
        const sessionUserId = getSessionUserId();
        if (sessionUserId == -1) {
            navigate('/auth');
        }
        getSessionUser().then(user => {
            if(user != null) {
                setUsername(user.username);
                setEmail(user.email);
            }
        });
    }, [navigate]);

    async function handleUpdateUserInfo() {
        const updatedUserResponse = await updateUserInfo(email, username);
        if(updatedUserResponse) {
            alert("Información actualizada correctamente");
        }
    }

    async function changePassword() {
        const updatedPasswordResponse = await updateUserPassword(password);
        if(updatedPasswordResponse) {
            alert("Contraseña actualizada correctamente");
        }
    }

    return (
        <>
            <Container className='profile-container'>
                <Typography variant="h6" component="h2" gutterBottom>Mi cuenta</Typography>
                <TextField id="outlined-basic" label="Nombre de usuario" variant="outlined" fullWidth margin="normal" value={username} className='input-field' onChange={(e) => setUsername(e.target.value)} />
                <TextField id="outlined-basic" label="Correo electrónico" variant="outlined" fullWidth margin="normal" value={email} className='input-field' onChange={(e) => setEmail(e.target.value)} />
                <Button
                    variant="contained"
                    fullWidth
                    style={{
                        marginTop: '16px',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: 'none'
                    }}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#388e3c',
                            color: '#fff'
                        }
                    }}
                    onClick={() => { /* Handle profile update */
                        handleUpdateUserInfo();
                    }}
                >
                    Guardar cambios
                </Button>
                <TextField id="outlined-basic" label="Contraseña" variant="outlined" fullWidth margin="normal" type="password" className='input-field' value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button
                    variant="contained"
                    fullWidth
                    style={{
                        marginTop: '16px',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        boxShadow: 'none'
                    }}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#388e3c',
                            color: '#fff'
                        }
                    }}
                    onClick={() => { 
                        changePassword();
                    }}
                >
                    Cambiar contraseña
                </Button>
                <Button color="inherit" onClick={handleLogout} sx={{ color: '#fff', border: '1px solid #4caf50', marginTop: 2 }}>
                    Cerrar sesión
                </Button>
            </Container>
            
        </>
    )
}

export default Profile;