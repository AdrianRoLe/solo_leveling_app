import React, { useEffect, useState } from 'react';
import DatabaseUser from '../models/DatabaseUser';
import { useNavigate } from 'react-router-dom';

const Login = ({ dbUser }: { dbUser: DatabaseUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check localStorage for persisted login state
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setIsLoggedIn(true);
      console.log('User restored from localStorage:', JSON.parse(storedUser));
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (dbUser.db) {
      const db = dbUser.db;
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');

      console.log('Attempting to fetch user by username:', user.username);

      const index = store.index('username');
      const request = index.get(user.username);

      request.onsuccess = () => {
        console.log('Request result:', request.result);
        if (request.result && request.result.password === user.password) {
          console.log('Login successful:', user);
          setErrorMessage('');
          setIsLoggedIn(true);

          // Persist login state to localStorage
          localStorage.setItem('loggedInUser', JSON.stringify(request.result));

          // Update file-based database
          dbUser.userUpdate(request.result).catch((err) => {
            console.error('Error updating user in file-based database:', err);
          });
        } else {
          setErrorMessage('Invalid username or password.');
        }
      };

      request.onerror = (event) => {
        console.error('Error during login:', event);
        setErrorMessage('Error during login.');
      };
    }
  };

  const handleLogout = () => {
    // Clear login state and localStorage
    localStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    setUser({ username: '', password: '' });
    console.log('User logged out.');
  };

  if (isLoggedIn) {
    return (
      <div>
        <h1>Welcome, {JSON.parse(localStorage.getItem('loggedInUser') || '{}').username}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate('/signup')}>Go to Signup</button>
    </div>
  );
};

export default Login;
