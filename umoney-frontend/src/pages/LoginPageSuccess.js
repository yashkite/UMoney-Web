import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiUtils } from '../api/utils/api.js';

const LoginPageSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      apiUtils.setAuthToken(token);
      navigate('/app/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default LoginPageSuccess;