import { useState, useEffect } from 'react';
import SpotifyService from '../services/spotifyService';

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if we've just returned from Spotify authorization
    if (window.location.hash.includes('access_token')) {
      const { accessToken, expiresIn } = SpotifyService.handleSpotifyCallback();
      
      // Store token in state and localStorage
      setAccessToken(accessToken);
      localStorage.setItem('spotify_access_token', accessToken);

      // Clear the hash to prevent token leak
      window.history.replaceState(
        null, 
        document.title, 
        window.location.pathname
      );

      // Fetch user profile
      fetchUserProfile(accessToken);
    } else {
      // Check for existing token in localStorage
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
        fetchUserProfile(storedToken);
      }
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear invalid token
      localStorage.removeItem('spotify_access_token');
      setAccessToken(null);
    }
  };

  const login = () => {
    window.location.href = SpotifyService.getAuthUrl();
  };

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    setAccessToken(null);
    setUser(null);
  };

  return { 
    accessToken, 
    user, 
    login, 
    logout,
    isLoggedIn: !!accessToken 
  };
};