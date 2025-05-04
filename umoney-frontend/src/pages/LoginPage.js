import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useLoaderData } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { useAuth } from '../contexts/AuthContext';
import UMoneyLogo from '../components/UMoneyLogo';

function LoginPage() {
  console.log('LoginPage: Initializing...');
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const loaderData = useLoaderData();

  // Function to parse cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Check if the user is already logged in
  const checkAuth = async () => {
    // Check if we have a redirect from the loader
    if (loaderData && loaderData.redirect) {
      navigate(loaderData.redirect);
      return;
    }

    if (isAuthenticated) {
      // Redirect to dashboard if already logged in
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 100);
      return;
    }

    // Check for authentication cookie as fallback
    const authCookie = getCookie('auth');
    if (authCookie === 'success') {
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 100);
    }
  };

  useEffect(() => {
    console.log('LoginPage: useEffect - Checking authentication...');
    checkAuth();

    // Check for successful login redirect from backend
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Use AuthContext login function
      login(token).then((userData) => {
        if (userData) {
          console.log('LoginPage: Login successful, user data:', userData);

          // Redirect to stored path or default to dashboard
          const redirectPath = localStorage.getItem('redirectPath') || '/app/dashboard';
          console.log('Redirecting to:', redirectPath);

          // Force a page reload to ensure all auth state is properly initialized
          window.location.href = redirectPath;
          localStorage.removeItem('redirectPath');
        } else {
          console.error('Login failed: No user data returned');
        }
      }).catch(error => {
        console.error('LoginPage: Login error:', error);
      });
    } else {
      console.log('LoginPage: useEffect - No token found in URL');
    }
  }, []);

  const handleGoogleLogin = () => {
    console.log('LoginPage: handleGoogleLogin - Starting Google login...');
    // Store current path to redirect back after login
    localStorage.setItem('redirectPath', window.location.pathname);
    // Redirect to backend Google auth endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleEmailLogin = (e) => {
    console.log('LoginPage: handleEmailLogin - Starting email login...');
    e.preventDefault();
    setLoading(true);

    // This is a placeholder for future email login implementation
    // For now, just redirect to Google login after a delay to simulate processing
    setTimeout(() => {
      setLoading(false);
      handleGoogleLogin();
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Background with gradient */}
      <div className="login-background"></div>

      <div className="flex align-items-center justify-content-center min-h-screen">
        <Card className="login-card shadow-8 border-round-xl" style={{ width: '28rem' }}>
          <div className="flex flex-column align-items-center">
            {/* Logo and Title */}
            <div className="mb-4 mt-2 text-center">
              <UMoneyLogo size="large" className="mb-3" />
              <h1 className="text-3xl font-bold mb-2 text-gradient">Welcome Back</h1>
              <p className="text-center text-700 mb-0">Sign in to continue to your account</p>
            </div>

            <div className="w-full">
              {!showEmailForm ? (
                <>
                  {/* Social Login Options */}
                  <div className="flex flex-column gap-3 mb-4 w-full">
                    <Button
                      label="Sign In with Google"
                      icon="pi pi-google"
                      onClick={handleGoogleLogin}
                      severity="primary"
                      raised
                      className="p-button-lg w-full login-button"
                    />

                    <Button
                      label="Continue with Email"
                      icon="pi pi-envelope"
                      onClick={() => setShowEmailForm(true)}
                      outlined
                      className="p-button-lg w-full"
                    />
                  </div>

                  {/* Trust Badges */}
                  <div className="flex align-items-center justify-content-center gap-2 mb-4">
                    <Badge value="Secure Connection" severity="success" className="p-2"></Badge>
                    <Badge value="Privacy Protected" severity="info" className="p-2"></Badge>
                  </div>
                </>
              ) : (
                <>
                  {/* Email Login Form */}
                  <form onSubmit={handleEmailLogin} className="p-fluid">
                    <div className="field mb-4">
                      <label htmlFor="email" className="font-medium mb-2 block">Email</label>
                      <span className="p-input-icon-left w-full">
                        <i className="pi pi-envelope" />
                        <InputText
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="p-inputtext-lg"
                          required
                        />
                      </span>
                    </div>

                    <div className="field mb-3">
                      <label htmlFor="password" className="font-medium mb-2 block">Password</label>
                      <Password
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        toggleMask
                        className="w-full p-inputtext-lg"
                        inputClassName="w-full"
                        required
                        feedback={false}
                      />
                    </div>

                    <div className="flex align-items-center justify-content-between mb-4">
                      <div className="flex align-items-center">
                        <Checkbox
                          inputId="rememberMe"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="rememberMe" className="text-sm">Remember me</label>
                      </div>
                      <a href="#" className="text-sm text-primary no-underline hover:underline">Forgot password?</a>
                    </div>

                    <Button
                      type="submit"
                      label="Sign In"
                      icon="pi pi-lock-open"
                      loading={loading}
                      className="p-button-lg w-full mb-3"
                    />

                    <Button
                      type="button"
                      label="Back to Options"
                      icon="pi pi-arrow-left"
                      className="p-button-text p-button-lg w-full"
                      onClick={() => setShowEmailForm(false)}
                    />
                  </form>
                </>
              )}

              <Divider align="center">
                <span className="text-600 font-light">OR</span>
              </Divider>

              <div className="text-center mb-3">
                <p className="m-0 text-600">Don't have an account?</p>
                <Button label="Create Account" className="p-button-link" onClick={handleGoogleLogin} />
              </div>

              <div className="text-center">
                <RouterLink to="/" className="no-underline text-primary hover:underline">
                  <i className="pi pi-home mr-1"></i>
                  Return to Home
                </RouterLink>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Notice */}
      <div className="absolute bottom-0 left-0 right-0 text-center p-3 text-500 text-xs">
        <i className="pi pi-lock mr-1"></i>
        Your connection is secure and your data is encrypted
      </div>
    </div>
  );
}

export default LoginPage;
