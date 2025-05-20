import React from 'react';
import AuthForm from '../components/AuthForm.tsx';
import DatabaseUser from '../models/DatabaseUser.tsx';

const Login = ({ dbUser }: { dbUser: DatabaseUser }) => {
  return <AuthForm dbUser={dbUser} isSignup={false} />;
};

export default Login;
