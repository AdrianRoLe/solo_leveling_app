import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Button from '@mui/material/Button'; // Import Material-UI Button
import React, { useEffect, useState } from 'react';
import UserExercises from '../components/UserExercises.tsx';
import UserInfo from '../components/UserInfo.tsx';
import { APP_COLOR_ITEMS, COLOR_SCHEME_VALUES, DEFAULT_COLOR_SCHEME, EXERCISE_LEVEL_CONTANT_DIFF, EXERCISE_TYPES } from "../models/Constants.tsx";
import DatabaseUser from '../models/DatabaseUser.tsx';
import Exercise from "../models/Exercise.tsx";
import { IExercise } from '../models/Interfaces.tsx';
import User from '../models/User.tsx';
import Login from './Login.tsx';

const Main = ({ dbUser }: { dbUser: DatabaseUser }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState(EXERCISE_TYPES.STRENGTH);
  const [newExerciseWeight, setNewExerciseWeight] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [colorScheme, setColorScheme] = useState<string>(DEFAULT_COLOR_SCHEME);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dbUser.getUser(parsedUser.username).then((updatedUser) => {
        if (updatedUser) {
          setLoggedInUser(updatedUser);
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        } else {
          setLoggedInUser(parsedUser);
        }
      }).catch((error) => {
        console.error("Error fetching user from database:", error);
        setLoggedInUser(parsedUser);
      });
    }

    if (dbUser.db) {
      const db = dbUser.db;
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');

      const request = store.getAll();

      request.onerror = (event) => {
        console.error('Error fetching user data:', event);
      };
    }

    // Retrieve color scheme from localStorage or set default
    const storedColorScheme = localStorage.getItem('colorScheme');
    if (storedColorScheme && COLOR_SCHEME_VALUES[storedColorScheme]) {
      setColorScheme(storedColorScheme);
    } else {
      localStorage.setItem('colorScheme', DEFAULT_COLOR_SCHEME);
    }
  }, [dbUser]);

  const calculateProgress = (current_exp: number, exercises: IExercise[]) => {
    // The level is calc based on the number of exercises and their levels
    const current_level = exercises.reduce((acc, exercise) => {
      return acc + exercise.level;
    }, 0);
    const total_exp_needed = (current_level + exercises.length) * 1000;
    const progress = (current_exp / total_exp_needed) * 100;
    return progress;
  };

  const updatePersistentData = (updatedUser: User) => {
    if (dbUser && dbUser.userUpdate) {
      dbUser.userUpdate(updatedUser).catch((error) => {
        console.error("Failed to update persistent data:", error);
      });
    }
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
  };

  const handleAddExercise = () => {
    if (loggedInUser) {
      const newExercise = new Exercise(newExerciseName);
      newExercise.fromJson({
        ...newExercise,
        category: newExerciseCategory,
        start_weight: newExerciseWeight,
        current_weight: newExerciseWeight,
        id: '',
        level: 0,
        exp: 0,
        start_date: new Date()
      });

      const updatedExercises = [...loggedInUser.exercises, newExercise].map((exercise) =>
        exercise instanceof Exercise ? exercise.toJson() : exercise
      );

      const updatedUser: User = {
        ...loggedInUser,
        exercises: updatedExercises,
      };

      setLoggedInUser(updatedUser);
      updatePersistentData(updatedUser);

      setShowForm(false);
      setNewExerciseName('');
      setNewExerciseCategory(EXERCISE_TYPES.STRENGTH);
      setNewExerciseWeight(0);
    }
  };

  const calculateLevel = (current_level: number, startWeight: number, currentWeight: number): number => {
    // Calc based in the % increase from the start weight and the level
    const current_level_weight = Math.floor(startWeight * (1 + ((current_level - 1) * EXERCISE_LEVEL_CONTANT_DIFF)));

    if (currentWeight >= current_level_weight) {
      return current_level + 1;
    }
    return current_level;
  };

  const handleIncreaseWeight = (index: number) => {
    if (loggedInUser) {
      const updatedExercises = [...loggedInUser.exercises];
      const exercise = updatedExercises[index];
      exercise.current_weight += 1;
      exercise.level = calculateLevel(exercise.level, exercise.start_weight, exercise.current_weight);

      // Update the exercise's exp based on the new weight using calculateExpBG
      const progressPercentage = parseFloat(
        calculateExpBG(exercise.exp, exercise.level, exercise.start_weight, exercise.current_weight).replace('%', '')
      );

      exercise.exp = progressPercentage;

      const updatedUser: User = {
        ...loggedInUser,
        exercises: updatedExercises.map((exercise) =>
          exercise instanceof Exercise ? exercise.toJson() : exercise
        ),
      };

      const new_global_level = Object.values(updatedExercises).reduce((acc, exercise) => {
        return acc + exercise.level;
      }, 0);
      const new_global_exp = Object.values(updatedExercises).reduce((acc, exercise) => {
        return acc + exercise.exp;
      }, 0);

      updatedUser.global_level = new_global_level;
      updatedUser.global_exp = new_global_exp;

      setLoggedInUser(updatedUser);
      updatePersistentData(updatedUser);
    }
  };

  const handleDeleteExercise = () => {
    if (loggedInUser && exerciseToDelete !== null) {
      const updatedExercises = [...loggedInUser.exercises];
      updatedExercises.splice(exerciseToDelete, 1);

      const updatedUser: User = {
        ...loggedInUser,
        exercises: updatedExercises.map((exercise) =>
          exercise instanceof Exercise ? exercise.toJson() : exercise
        ),
      };

      setLoggedInUser(updatedUser);
      updatePersistentData(updatedUser);
      setShowDeleteModal(false);
      setExerciseToDelete(null);
    }
  };

  const openDeleteModal = (index: number) => {
    setExerciseToDelete(index);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  const calculateExpBG = (exp: number, level: number, startWeight: number, currentWeight: number) => {
    const current_level_weight = Math.floor(startWeight * (1 + ((level - 1) * EXERCISE_LEVEL_CONTANT_DIFF)));
    const progress_percentage = 90.0 / (current_level_weight - currentWeight);
    const red_progress = progress_percentage;

    return `${red_progress}%`;
  };

  const handleColorSchemeChange = (newScheme: string) => {
    setColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
    setShowSettingsModal(false);
  };

  const applyColorScheme = COLOR_SCHEME_VALUES[colorScheme];

  const filteredExercises = loggedInUser && loggedInUser.exercises
    ? loggedInUser.exercises.filter((exercise) =>
      selectedCategory ? exercise.category === selectedCategory : true
    )
    : [];

  return (
    <div
      style={{
        backgroundColor: applyColorScheme[APP_COLOR_ITEMS.APP_BG_COLOR],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        minHeight: '100vh',
        width: '100%',
        border: `1px solid ${applyColorScheme[APP_COLOR_ITEMS.PRIMARY]}`,
        borderRadius: '80px',
      }}
    >
      {/* render Login if there are users in the db but no one is logged in */}
      {!loggedInUser && (
        <div>
          <Login dbUser={dbUser} />
        </div>
      )}

      {/* Render UserInfo if loggedInUser exists */}
      {loggedInUser && (
        <UserInfo
          loggedInUser={loggedInUser}
          colorScheme={colorScheme}
          calculateProgress={calculateProgress}
          setShowSettingsModal={setShowSettingsModal}
          handleLogout={handleLogout}
          handleColorSchemeChange={handleColorSchemeChange}
          showSettingsModal={showSettingsModal}
        />
      )}
      {loggedInUser && (
        <div>
          <h2>Welcome, {loggedInUser.username}!</h2>
        </div>
      )}
      {loggedInUser && (
        <div style={{ width: '90%' }}>
          {/* Filter by Category */}
          <FormControl size="small" fullWidth margin="normal">
            <InputLabel size="small" style={{ color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY] }}>Filter by Category</InputLabel>
            <Select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              style={{
                backgroundColor: applyColorScheme[APP_COLOR_ITEMS.APP_BG_COLOR],
                color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
              }}
            >
              <MenuItem value="">All</MenuItem>
              {Object.values(EXERCISE_TYPES).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <UserExercises
            exercises={filteredExercises}
            colorScheme={colorScheme}
            calculateExpBG={calculateExpBG}
            handleIncreaseWeight={handleIncreaseWeight}
            openDeleteModal={openDeleteModal}
          />

          <Button
            variant="contained"
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
              color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
              marginBottom: '20px',
            }}
          >
            {showForm ? 'Cancel' : 'Add Exercise'}
          </Button>
          {showForm && (
            <form onSubmit={(e) => { e.preventDefault(); handleAddExercise(); }}>
              <div>
                <TextField
                  label="Exercise Name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  required
                  fullWidth
                  margin="normal"
                />
              </div>
              <div>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newExerciseCategory}
                    onChange={(e) => setNewExerciseCategory(e.target.value as EXERCISE_TYPES)}
                  >
                    {Object.values(EXERCISE_TYPES).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                <TextField
                  label="Current Weight (kg)"
                  type="number"
                  value={newExerciseWeight}
                  onChange={(e) => setNewExerciseWeight(Number(e.target.value))}
                  required
                  fullWidth
                  margin="normal"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      type: 'number',
                      step: 1,
                    },
                  }}
                  placeholder='1kg'
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                style={{
                  backgroundColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
                  color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
                  marginTop: '10px',
                }}
              >
                Add Exercise
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: applyColorScheme[APP_COLOR_ITEMS.APP_BG_COLOR],
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              width: '300px',
              color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
            }}
          >
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this exercise?</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>

              <Button
                variant="outlined"
                onClick={closeDeleteModal}
                style={{
                  color: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
                  borderColor: applyColorScheme[APP_COLOR_ITEMS.PRIMARY],
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDeleteExercise}
                style={{
                  backgroundColor: applyColorScheme[APP_COLOR_ITEMS.TERTIARY],
                  color: applyColorScheme[APP_COLOR_ITEMS.SECONDARY],
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;

