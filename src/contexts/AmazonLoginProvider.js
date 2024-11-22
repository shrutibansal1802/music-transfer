import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAmazonSdk } from '../hooks/useAmazonAuth';

const AmazonLoginContext = createContext();

export function AmazonLoginProvider({ children }) {
    const sdkState = useAmazonSdk();
    const [userState, setUserState] = useState({
        isLoggedIn: false,
        userProfile: null,
        accessToken: null,
        isLoading: true,
    });

    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch('https://api.amazon.com/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const profile = await response.json();
            setUserState((prev) => ({
                ...prev,
                isLoggedIn: true,
                userProfile: {
                    name: profile.name,
                    email: profile.email,
                    userId: profile.user_id,
                },
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error fetching profile:', error);
            logout();
        }
    };

    const checkLoginState = async () => {
        const token = sessionStorage.getItem('amazonAccessToken');
        if (token) {
            await fetchUserProfile(token);
        } else {
            setUserState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    useEffect(() => {
        checkLoginState();
    }, []);

    const login = () => {
        return new Promise((resolve, reject) => {
            if (!sdkState.loaded) {
                reject(new Error('Amazon Login SDK not loaded'));
                return;
            }

            window.amazon.Login.authorize(
                { scope: ['profile'] },
                async (response) => {
                    if (response.error) {
                        reject(response.error);
                        return;
                    }

                    const token = response.access_token;
                    sessionStorage.setItem('amazonAccessToken', token);

                    // Fetch the user profile
                    await fetchUserProfile(token);

                    resolve(response);
                }
            );
        });
    };

    const logout = () => {
        sessionStorage.removeItem('amazonAccessToken');
        setUserState({ isLoggedIn: false, userProfile: null, accessToken: null, isLoading: false });
    };

    return (
        <AmazonLoginContext.Provider value={{ ...sdkState, ...userState, login, logout }}>
            {children}
        </AmazonLoginContext.Provider>
    );
}

export function useAmazonLogin() {
    const context = useContext(AmazonLoginContext);
    if (!context) {
        throw new Error('useAmazonLogin must be used within AmazonLoginProvider');
    }
    return context;
}
