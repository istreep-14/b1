import React, { useState, useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ShiftManager from './components/ShiftManager';
import CoworkerDatabase from './components/CoworkerDatabase';
import { ExclamationTriangleIcon, UserCircleIcon } from './components/Icons';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { GoogleApiContext } from './contexts/GoogleApiContext';
import Checkbox from './components/ui/Checkbox';
import SettingsPage from './SettingsPage';

export type Page = 'DASHBOARD' | 'COWORKERS' | 'SETTINGS';

const App: React.FC = () => {
  const { isAuthenticated, isInitialized, signIn, signOut, apiError } = useContext(GoogleApiContext);
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [isShowingAuth, setIsShowingAuth] = useState(false);

  useEffect(() => {
    // If user signs in successfully, hide the auth screen
    if (isAuthenticated) {
      setIsShowingAuth(false);
    }
  }, [isAuthenticated]);

  const AuthScreen: React.FC = () => {
    const [hasConfirmedOrigin, setHasConfirmedOrigin] = useState(false);
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'Loading...';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4">
        <Card className="text-center max-w-lg w-full">
          <h1 className="text-3xl font-bold text-brand-accent mb-2">Shift Tracker</h1>

          {apiError ? (
             <div className="my-6 text-left w-full">
               <p className="text-red-400 font-semibold text-center mb-3">Authentication Error</p>
               <div className="text-dark-text-secondary mt-2 text-xs sm:text-sm bg-zinc-900 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-sans break-words">
                      {apiError}
                  </pre>
                  {apiError.includes('Google Cloud Console') && (
                      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline mt-4 block text-center font-semibold">
                          Go to Google Cloud Credentials
                      </a>
                  )}
               </div>
             </div>
          ) : (
            <>
              <p className="text-dark-text-secondary mb-6">Log in with Google to manage your shifts.</p>
              
              <div className="text-left bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-300">Action Required: Configure Google Sign-In</h3>
                      <p className="text-sm text-amber-300/80 mt-1">
                        Before signing in, you <span className="font-bold">must</span> add your app's current URL to your Google Cloud project's authorized origins list.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm space-y-2">
                    <p className="font-semibold">1. Copy this exact URL:</p>
                    <div className="p-2 bg-zinc-900 rounded font-mono text-brand-accent text-center break-all">
                      {originUrl}
                    </div>
                    <p className="pt-2">
                      2. Add it to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-accent hover:underline">"Authorized JavaScript origins"</a> list in your OAuth 2.0 Client ID settings.
                    </p>
                  </div>
              </div>
              
              <div className="mb-6">
                <Checkbox 
                  label="I have added the URL to my Google Cloud project."
                  checked={hasConfirmedOrigin}
                  onChange={(e) => setHasConfirmedOrigin(e.target.checked)}
                />
              </div>

              <Button 
                onClick={signIn} 
                className="w-full" 
                disabled={!isInitialized || !hasConfirmedOrigin}
                aria-disabled={!isInitialized || !hasConfirmedOrigin}
              >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                {isInitialized ? 'Sign In with Google' : 'Initializing...'}
              </Button>
            </>
          )}
          
          {!apiError && isShowingAuth && (
            <Button variant="secondary" onClick={() => setIsShowingAuth(false)} className="w-full mt-4">
              Continue in Preview Mode
            </Button>
          )}
        </Card>
      </div>
    );
  };

  // Show auth screen if user explicitly wants to sign in,
  // or if there's a blocking API error and they are not yet authenticated.
  if (isShowingAuth || (!isAuthenticated && apiError)) {
    return <AuthScreen />;
  }

  return (
    <div className="relative min-h-screen bg-dark-bg text-dark-text">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={signOut}
        onLogin={() => setIsShowingAuth(true)}
        isAuthenticated={isAuthenticated}
      />
      {/* Main content with a left margin equal to the collapsed sidebar width */}
      <div className="ml-16 transition-all duration-300 ease-in-out">
        {activePage === 'DASHBOARD' && <ShiftManager />}
        {activePage === 'COWORKERS' && <CoworkerDatabase />}
        {activePage === 'SETTINGS' && <SettingsPage />}
      </div>
    </div>
  );
};

export default App;