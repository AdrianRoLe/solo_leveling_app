import React from 'react';
import AuthForm from '../components/AuthForm.tsx';
import DatabaseUser from '../models/DatabaseUser.tsx';

const Signup = ({ dbUser }: { dbUser: DatabaseUser }) => {
  return <AuthForm dbUser={dbUser} isSignup={true} />;
};

export default Signup;
