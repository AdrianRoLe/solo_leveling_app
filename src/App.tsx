import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import DatabaseUser from './models/DatabaseUser.tsx';
import Login from './pages/Login.tsx';
import Main from './pages/Main.tsx';
import Signup from './pages/Signup.tsx';

function App() {
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);

  useEffect(() => {
    const openRequest = indexedDB.open('SoloLevelingDB', 1);

    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: true });
      }
    };

    openRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      setDbUser(new DatabaseUser(db));
    };

    openRequest.onerror = (event) => {
      console.error('Error opening database:', event);
    };
  }, []);

  if (!dbUser || !dbUser.db) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main dbUser={dbUser} />} />
        <Route path="login" element={<Login dbUser={dbUser} />} />
        <Route path="signup" element={<Signup dbUser={dbUser} />} />
      </Routes>
    </div>
  );
}

export default App;
