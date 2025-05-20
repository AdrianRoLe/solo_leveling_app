import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatabaseUser from '../models/DatabaseUser.tsx';
import User from '../models/User.tsx';

const Signup = ({ dbUser }: { dbUser: DatabaseUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUser, setNewUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = () => {
    const user = new User(username, password);

    if (dbUser.db) {
      const db = dbUser.db;
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');

      // Check if the user already exists
      const request = store.get(user.username);
      request.onsuccess = () => {
        if (request.result) {
          setErrorMessage(`Error: User with username "${user.username}" already exists.`);
        } else {
          // Add the new user if it doesn't exist
          store.add(user);

          transaction.oncomplete = () => {
            console.log('User added to the database:', user);
            setErrorMessage(''); // Clear error message on success
            setNewUser(user);

            // Save to file-based database
            dbUser.userUpdate(user).catch((err) => {
              console.error('Error saving user to file-based database:', err);
            });
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
  };

  return (
    <div>
      <h1>Signup</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
      >
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={() => navigate('/login')}>Go to Login</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {newUser && (
        <div>
          <h2>New User Created:</h2>
          <p>Username: {newUser.username}</p>
          <p>Global Level: {newUser.global_level}</p>
          <p>Global Exp: {newUser.global_exp}</p>
        </div>
      )}
    </div>
  );
};

export default Signup;
