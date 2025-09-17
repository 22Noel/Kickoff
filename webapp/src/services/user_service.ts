import axios from 'axios';
import { InvalidTokenError, jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from '../types/jwt';
import User from '../types/User';
import { UnexistingSessionUserError, MissingTokenError, ExpiredSessionError } from '../types/Errors';

let VITE_DEBUG: boolean = true;
let VITE_API_URL: string = 'http://localhost:3000/api';

if(import.meta.env.VITE_ENV === 'production') {
    console.log("Using production environment for user service");
    VITE_API_URL = import.meta.env.VITE_API_URL;
    VITE_DEBUG = false;
} else {
    console.log("Using development environment for user service");
}

export async function getUserByUsername(username: string): Promise<User | null> {
    if(VITE_DEBUG) {
        console.log("Get user by username request: ", username);
    }

    const response = await axios.get(`${VITE_API_URL}/users/${username}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if(response.status == 404) {
        console.error("User not found");
        return null;
    }

    return response.data;
};

export async function login(username: string, password: string): Promise<any> {
    if(VITE_DEBUG) {
        console.log("Login request: ", username, password);
    }

    const response = await axios.post(`${VITE_API_URL}/users/login`, {
        username,
        password,
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
    });

    if(response.status == 200) {
        localStorage.setItem('jwt-token', response.data.token);
    }

    if(VITE_DEBUG) {
        console.log("Login response: ", response.data);
        console.log("Login response status: ", response.status);
    }

    return response.data;
};

export async function register(username: string, email: string, password: string): Promise<any> {
    if(VITE_DEBUG) {
        console.log("Register request: ", username, email);
    }

    const response = await axios.post(`${VITE_API_URL}/users/register`, {
        username,
        email,
        password,
    }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if(response.status == 201) {
        localStorage.setItem('jwt-token', response.data.token);
    }

    if(VITE_DEBUG) {
        console.log("Register response: ", response.data);
        console.log("Register response status: ", response.status);
    }

    return response.data;
};

export function getSessionUserId(): number {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
        return -1;
    }

    try {
        const decodedToken : CustomJwtPayload = jwtDecode(token);
        if (VITE_DEBUG) {
            console.log('Decoded JWT token:', decodedToken);
        }
        if(decodedToken.exp * 1000 < Date.now()) {
            return -1;
        }
        return decodedToken.userId;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        if(error instanceof InvalidTokenError) {
            console.error('Invalid token, removing from localStorage');
            localStorage.removeItem('jwtToken');
        }
    }
    return -1;
}

export function getSessionUsername(): string | null {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
        throw new MissingTokenError();
    }

    try {
        const decodedToken : CustomJwtPayload = jwtDecode(token);
        if (VITE_DEBUG) {
            console.log('Decoded JWT token:', decodedToken);
        }
        if (!decodedToken || decodedToken.userId == null) {
            throw new UnexistingSessionUserError();
        }
        if (decodedToken.exp * 1000 < Date.now()) {
            throw new ExpiredSessionError();
        }
        
        return decodedToken.username;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        throw error;
    }
}

export async function getSessionUser(): Promise<User | null> {
    const username = getSessionUsername();
    if(username != null) {
        const user = await getUserByUsername(username);
        if(!user) {
            throw new UnexistingSessionUserError();
        } else if(user != null) {
            return new User(user.id, user.username, user.email, user.password);
        }
    }
    return null;
}

export async function updateUserInfo(username: string, email: string): Promise<any> {
    const userId = getSessionUserId();
    if (userId == -1) {
        throw new Error("User not authenticated");
    }

    const response = await axios.put(`${VITE_API_URL}/users/${userId}`, {
        username,
        email
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        }
    });

    if (response.status == 200) {
        localStorage.setItem('jwt-token', response.data.token);
    }

    return response.data;
}

export async function updateUserPassword(newPassword: string): Promise<any> {
    const userId = getSessionUserId();
    if (userId == -1) {
        throw new Error("User not authenticated");
    }

    const response = await axios.put(`${VITE_API_URL}/users/${userId}/password`, {
        newPassword
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        }
    });

    if (response.status == 200) {
        localStorage.setItem('jwt-token', response.data.token);
    }

    return response.data;
}
