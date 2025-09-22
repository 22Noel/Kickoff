import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import * as userService from '../services/user_service';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../services/user_service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: () => mockNavigate,
	useLocation: () => ({ state: {} })
}));

jest.mock('../services/user_service', () => ({
    register: jest.fn().mockResolvedValue({ token: 'valid-token' }),
    getSessionUserId: jest.fn().mockReturnValue(-1),
}));

beforeEach(() => {
	jest.clearAllMocks();
	localStorage.clear();
});

test('redirects to home if already logged in', () => {
    jest.spyOn(userService, 'getSessionUserId').mockReturnValue(1);
	render(<SignUp />, { wrapper: MemoryRouter });
	expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('stores token in localStorage and redirects to home on successful signup', async () => {
	render(<SignUp />, { wrapper: MemoryRouter });
	fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'user' } });
	fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@email.com' } });
	fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass' } });
	fireEvent.click(screen.getByTestId('signup-button'));
	await waitFor(() => {
		expect(localStorage.getItem('jwtToken')).toBe('valid-token');
		expect(mockNavigate).toHaveBeenCalledWith('/');
	});
});

test('redirects to redirectUrl if present in localStorage after signup', async () => {
	localStorage.setItem('redirectUrl', '/special');
	render(<SignUp />, { wrapper: MemoryRouter });
	fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'user' } });
	fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@email.com' } });
	fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass' } });
	fireEvent.click(screen.getByTestId('signup-button'));
	await waitFor(() => {
		expect(localStorage.getItem('jwtToken')).toBe('valid-token');
		expect(mockNavigate).toHaveBeenCalledWith('/special');
		expect(localStorage.getItem('redirectUrl')).toBeNull();
	});
});

test('displays error when signup fails', async () => {
    jest.spyOn(userService, 'register').mockResolvedValue({ error: 'El nombre de usuario ya existe' });
	render(<SignUp />, { wrapper: MemoryRouter });
	fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'user' } });
	fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@email.com' } });
	fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass' } });
	fireEvent.click(screen.getByTestId('signup-button'));
	await waitFor(() => {
		expect(screen.getByText('El nombre de usuario ya existe')).toBeInTheDocument();
		expect(localStorage.getItem('jwtToken')).toBeNull();
	});
});

test('redirects to login page when clicking "Volver a Inicio Sesión"', () => {
	render(<SignUp />, { wrapper: MemoryRouter });
	fireEvent.click(screen.getByTestId('login-button'));
	expect(mockNavigate).toHaveBeenCalledWith('/auth', expect.anything());
});
