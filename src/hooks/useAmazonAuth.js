
import { useState, useEffect } from 'react';

export function useAmazonSdk() {
  const [sdkState, setSdkState] = useState({ loaded: false, error: null });

  useEffect(() => {
    const initializeAmazonSdk = () => {
      try {
        window.amazon.Login.setClientId(process.env.REACT_APP_AMAZON_CLIENT_ID);
        setSdkState({ loaded: true, error: null });
      } catch (error) {
        setSdkState({ loaded: false, error: error.message });
      }
    };

    if (window.amazon?.Login) {
      initializeAmazonSdk();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.loginwithamazon.com/sdk/na/login1.js';
    script.async = true;

    script.onload = initializeAmazonSdk;
    script.onerror = () =>
      setSdkState({ loaded: false, error: 'Failed to load SDK' });

    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return sdkState;
}
