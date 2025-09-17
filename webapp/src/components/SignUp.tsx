import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Login.css'
import { register, getSessionUserId } from '../services/user_service';

function SignUp() { 
    const location = useLocation();
    const [username, setUsername] = useState(location.state?.username || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(location.state?.password || '');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userId = getSessionUserId();
        if (userId != -1) {
            navigate('/');
        }
    }, []);

    const navigateAfterAuth = () => {
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
            localStorage.removeItem('redirectUrl');
            navigate(redirectUrl);
        } else {
            navigate('/');
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        if (!username || !email || !password) {
            setErrorMessage('Por favor rellena todos los campos');
            return;
        }
        // Simple email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setErrorMessage('Por favor introduce una dirección de correo electrónico válida');
            return;
        }
        try {
            // Note: register only takes username and password for now
            const response = await register(username, email, password);
            if (response && response.token) {
                localStorage.setItem('jwtToken', response.token);
                navigateAfterAuth();
            } else if (response && response.error) {
                setErrorMessage(response.error || 'El nombre de usuario ya existe');
            } else {
                setErrorMessage('El nombre de usuario ya existe');
            }
        } catch (err) {
            setErrorMessage('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    const handleBackToLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/auth', { state: { username, password } });
    };

    return (
        <div className="login-wrapper">
            <form className="form">
                <h2 id="heading">Crear Cuenta</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="field">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
                    </svg>
                    <input 
                        autoComplete="off" 
                        placeholder="Username" 
                        className="input-field" 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div className="field">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-6.293 3.776a1 1 0 0 1-1.414 0L1 5.383V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z"/>
                    </svg>
                    <input 
                        autoComplete="off"
                        placeholder="Email"
                        className="input-field"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="field">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                    </svg>
                    <input 
                        placeholder="Password" 
                        className="input-field" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <div className="btn">
                    <button className="button1" onClick={handleSignUp}>Crear Cuenta</button>
                </div>
                <button className="button2" onClick={handleBackToLogin}>Volver a Inicio Sesión</button>
            </form>
        </div>
    );
}

export default SignUp;
