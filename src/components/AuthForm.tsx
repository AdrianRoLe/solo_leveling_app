import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseUser from '../models/DatabaseUser.tsx';
import User from '../models/User.tsx';

const AuthForm = ({
	dbUser,
	isSignup,
}: {
	dbUser: DatabaseUser;
	isSignup: boolean;
}) => {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (isSignup) {
			const newUser = new User(username, password);

			if (dbUser.db) {
				const db = dbUser.db;
				const transaction = db.transaction('users', 'readwrite');
				const store = transaction.objectStore('users');

				const request = store.get(newUser.username);
				request.onsuccess = () => {
					if (request.result) {
						setErrorMessage(`Error: User with username "${newUser.username}" already exists.`);
					} else {
						store.add(newUser);

						transaction.oncomplete = () => {
							console.log('User added to the database:', newUser);
							setErrorMessage('');
							dbUser.userUpdate(newUser).catch((err) => {
								console.error('Error saving user to file-based database:', err);
							});
							navigate('/login'); // Redirect to login page
						};

						transaction.onerror = (event) => {
							console.error('Error adding user to the database:', event);
							setErrorMessage('Error adding user to the database.');
						};
					}
				};

				request.onerror = (event) => {
					console.error('Error checking user existence:', event);
					setErrorMessage('Error checking user existence.');
				};
			}
		} else {
			if (dbUser.db) {
				const db = dbUser.db;
				const transaction = db.transaction('users', 'readonly');
				const store = transaction.objectStore('users');

				const index = store.index('username');
				const request = index.get(username);

				request.onsuccess = () => {
					if (request.result && request.result.password === password) {
						setErrorMessage('');
						localStorage.setItem('loggedInUser', JSON.stringify(request.result));
						dbUser.userUpdate(request.result).catch((err) => {
							console.error('Error updating user in file-based database:', err);
						});
						navigate('/'); // Redirect to main page
					} else {
						setErrorMessage('Invalid username or password.');
					}
				};

				request.onerror = (event) => {
					console.error('Error during login:', event);
					setErrorMessage('Error during login.');
				};
			}
		}
	};

	return (
		<Box
			sx={{
				maxWidth: 400,
				margin: 'auto',
				padding: 3,
				borderRadius: 2,
				boxShadow: 3,
				backgroundColor: '#fff',
			}}
		>
			<Typography variant="h4" align="center" gutterBottom>
				{isSignup ? 'Signup' : 'Login'}
			</Typography>
			<form onSubmit={handleSubmit}>
				<TextField
					label="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					fullWidth
					margin="normal"
					required
					autoComplete={isSignup ? 'username' : 'current-username'}
				/>
				<TextField
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					fullWidth
					margin="normal"
					required
					autoComplete={isSignup ? 'new-password' : 'current-password'}
				/>
				{errorMessage && (
					<Typography color="error" variant="body2" align="center" gutterBottom>
						{errorMessage}
					</Typography>
				)}
				<Button
					type="submit"
					variant="contained"
					color="primary"
					fullWidth
					sx={{ marginTop: 2 }}
				>
					{isSignup ? 'Sign Up' : 'Login'}
				</Button>
			</form>
			<Button
				onClick={() => navigate(isSignup ? '/login' : '/signup')}
				variant="text"
				fullWidth
				sx={{ marginTop: 2 }}
			>
				{isSignup ? 'Go to Login' : 'Go to Signup'}
			</Button>
		</Box>
	);
};

export default AuthForm;
