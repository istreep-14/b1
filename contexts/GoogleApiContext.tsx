import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_KEY, CLIENT_ID, SCOPES } from '../config';

// Type assertions for gapi and google global objects
declare const gapi: any;
declare const google: any;

interface GoogleApiContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  apiError: string | null;
  signIn: () => void;
  signOut: () => void;
}

export const GoogleApiContext = createContext<GoogleApiContextType>({
  isAuthenticated: false,
  isInitialized: false,
  apiError: null,
  signIn: () => {},
  signOut: () => {},
});

interface GoogleApiProviderProps {
  children: ReactNode;
}

export const GoogleApiProvider: React.FC<GoogleApiProviderProps> = ({ children }) => {
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGisLoaded, setIsGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const gapiLoaded = useCallback(() => {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      }).then(() => {
        setIsGapiLoaded(true);
      }).catch((err: any) => {
        console.error("GAPI client init error:", err);
        setApiError(err.details || "Failed to initialize Google API client. Check your API Key and ensure the Google Sheets API is enabled.");
        setIsAuthenticated(false); // Fail auth if gapi fails
      });
    });
  }, []);

  const gisLoaded = useCallback(() => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('GIS Error:', tokenResponse);
            if (tokenResponse.error === 'redirect_uri_mismatch') {
              const errorMessage = `Google Sign-In Failed: Mismatched URL.

This means the URL the app is running on is not whitelisted in your Google Cloud project.

1. Copy this exact URL:
   ${window.location.origin}

2. Go to your Google Cloud Console's "Credentials" page.

3. Find your "OAuth 2.0 Client ID" and open it for editing.

4. Add the copied URL to the "Authorized JavaScript origins" list.

Note: Google's error mentions "redirect_uri", but for browser apps, the setting to change is "Authorized JavaScript origins".`;
              setApiError(errorMessage);
            } else if (tokenResponse.error === 'access_denied') {
               const errorMessage = `Access Denied: Google blocked the sign-in request.

This usually happens for one of two reasons:
1. Your OAuth Consent Screen in Google Cloud is in "Testing" mode and your email is not added as a test user.
2. You closed the Google sign-in pop-up window.

Troubleshooting Steps:
- Go to your Google Cloud Console's "OAuth consent screen".
- Either add your email address under "Test users" or click "PUBLISH APP" to move it to to Production.`;
              setApiError(errorMessage);
            } else {
              setApiError(`Google Sign-In error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            setIsAuthenticated(false);
            return;
          }
          setIsAuthenticated(true);
        },
      });
      setTokenClient(client);
      setIsGisLoaded(true);
    } catch (e) {
      console.error("GIS init error:", e);
      setApiError("Failed to initialize Google Sign-In. Check your Client ID and authorized origins in Google Cloud Console.");
      setIsAuthenticated(false); // Fail auth if gis fails
    }
  }, []);
  
  // Load GAPI and GIS scripts once on component mount
  useEffect(() => {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = gapiLoaded;
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = gisLoaded;
    document.body.appendChild(gisScript);

    return () => {
      // Check if scripts were added before trying to remove
      if (gapiScript.parentNode) document.body.removeChild(gapiScript);
      if (gisScript.parentNode) document.body.removeChild(gisScript);
    };
  }, [gapiLoaded, gisLoaded]);

  const signIn = () => {
    if (apiError) {
      console.error("Cannot sign in due to API error:", apiError);
      return;
    }
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
       console.error("Sign-in client not initialized.");
    }
  };

  const signOut = () => {
    setIsAuthenticated(false); // Go back to logged-out state
    const token = gapi?.client?.getToken();
    if (token && token.access_token && google?.accounts) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
      });
    }
  };

  return (
    <GoogleApiContext.Provider value={{
      isAuthenticated,
      isInitialized: isGapiLoaded && isGisLoaded && !apiError,
      apiError,
      signIn,
      signOut
    }}>
      {children}
    </GoogleApiContext.Provider>
  );
};
