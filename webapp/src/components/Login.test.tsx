import { render, waitFor} from '@testing-library/react';
import Login from './Login';
import * as userService from '../services/user_service';
import { fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/user_service', () => ({
    login: jest.fn().mockResolvedValue({ token: 'mockToken' }),
    getSessionUserId: jest.fn().mockReturnValue(-1),
}));

import { MemoryRouter, Router } from 'react-router-dom';
import * as router from 'react-router-dom';

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(router, 'useNavigate').mockImplementation(jest.fn());
  jest.spyOn(userService, 'login').mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('Login component renders correctly', () => {
    const { asFragment, findAllByText } = render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
    expect(asFragment()).toBeDefined();
    expect(findAllByText('Iniciar Sesión')).toBeTruthy();
});

it('Login button shows an alert when fields are empty', async () => {
    const { getByTestId } = render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    const loginButton = getByTestId('login-button');

    // Simulate clicking the login button without filling in the fields
    loginButton.click();

    // Check if alert is called
    expect(window.alert).toHaveBeenCalled();

});

it('Login button calls login service with correct credentials', async () => {
    const { getByTestId } = render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    const usernameInput = getByTestId('username-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // Fill in the fields
    if(!usernameInput || !passwordInput || !loginButton) {
        throw new Error('Login inputs or button not found');
    }
    fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    // Check if alert is called
    await waitFor(() => {
        expect(window.alert).not.toHaveBeenCalled();
        expect(userService.login).toHaveBeenCalledWith('testuser', 'testpassword');
    });
    
});

it('Redirects to home page on successful login', async () => {
    jest.spyOn(userService, 'login').mockResolvedValue({ token: 'mockToken' });

    const { getByTestId } = render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    const usernameInput = getByTestId('username-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // Fill in the fields
    fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
        expect(userService.login).toHaveBeenCalledWith('testuser', 'testpassword');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});

it('Redirects to auth page if user is not authenticated', async () => {
    jest.spyOn(userService, 'getSessionUserId').mockReturnValue(-1);

    const { getByTestId } = render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    const usernameInput = getByTestId('username-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    // Fill in the fields
    fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
        expect(userService.getSessionUserId).toHaveBeenCalled();
        expect(alert).toHaveBeenCalled();
    });
});

it('Redirects to signup page when "Crear cuenta" is clicked', async () => {
    const history = createMemoryHistory();
    const { getByTestId } = render(
        <Router location={history.location} navigator={history}>
            <Login />
        </Router>
    );

    const signupLink = getByTestId('signup-link');
    fireEvent.click(signupLink);

    await waitFor(() => {
        expect(history.location.pathname).toBe('/signup');
    });
});
