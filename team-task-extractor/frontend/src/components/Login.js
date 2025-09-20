import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Spinner
} from '@fluentui/react-components';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    // Check if we have an auth code from Microsoft redirect
    const code = searchParams.get('code');
    if (code) {
      handleAuthCallback(code);
    } else {
      fetchAuthUrl();
    }
  }, [searchParams]);

  const fetchAuthUrl = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/url');
      setAuthUrl(response.data.authUrl);
    } catch (error) {
      console.error('Error fetching auth URL:', error);
    }
  };

  const handleAuthCallback = async (code) => {
    try {
      setLoading(true);
      await login(code);
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spinner size="large" />
        <Text>Authenticating with Microsoft...</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
        <CardHeader
          header={
            <div>
              <Text size={900} weight="bold" style={{ marginBottom: '10px' }}>
                Teams Task Extractor
              </Text>
              <Text size={400}>
                Automatically extract action items from your Teams meeting transcripts
              </Text>
            </div>
          }
        />
        
        <div style={{ marginTop: '30px' }}>
          <Button 
            appearance="primary" 
            size="large"
            onClick={handleLogin}
            disabled={!authUrl}
            style={{ width: '100%' }}
          >
            Sign in with Microsoft
          </Button>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <Text size={300} weight="semibold">Features:</Text>
          <ul style={{ fontSize: '12px', color: '#605e5c', marginTop: '10px' }}>
            <li>Connect to your Teams meetings</li>
            <li>Automatically extract action items</li>
            <li>Track task assignments and deadlines</li>
            <li>Manage task completion status</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default Login;