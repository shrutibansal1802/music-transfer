import React, { useState, useEffect } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import SpotifyService from './services/spotifyService';
import AmazonMusicService from './services/amazonService';
import Button from './components/Button';
import PlaylistSelector from './components/PlaylistSelector';
import { useAmazonLogin } from './contexts/AmazonLoginProvider';
import { UserProfile } from './components/UserProfile';


const App = () => {
  const spotifyAuth = useSpotifyAuth();
  const amazonAuth = useAmazonLogin();

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [step, setStep] = useState(1);
  
  const [transferProgress, setTransferProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  // Automatically check login state on load.
  useEffect(() => {
    const autoLoginCheck = async () => {
      if (spotifyAuth.accessToken) {
        setStep(2); // Proceed to playlist selection if Spotify is logged in.
      } else if (!spotifyAuth.accessToken && !amazonAuth.isLoggedIn) {
        setStep(1); // Show login options if neither account is logged in.
      }
    };
    autoLoginCheck();
  }, [spotifyAuth.accessToken, amazonAuth.isLoggedIn]);


  // Fetch playlists when Spotify access token is available
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (spotifyAuth.accessToken) {
        setLoading(true);
        try {
          const userPlaylists = await SpotifyService.getUserPlaylists(spotifyAuth.accessToken);
          setPlaylists(userPlaylists);
          setStep(2);
        } catch (error) {
          console.error('Error fetching playlists:', error);
          spotifyAuth.logout();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlaylists();
  }, [spotifyAuth.accessToken]);

  const handlePlaylistSelect = (playlistId) => {
    setSelectedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleProceedToAmazon = () => {
    // Move to Amazon login step after playlist selection
    setStep(3);
  };

  const handleTransfer = async () => {
    const amazonMusicService = new AmazonMusicService(amazonAuth.accessToken)

    // Ensure both Spotify and Amazon are logged in
    if (!spotifyAuth.accessToken || !amazonAuth.isLoggedIn) {
      alert('Please log in to both Spotify and Amazon Music');
      return;
    }

    // Reset transfer progress
    setTransferProgress([]);
    setStep(4);

    try {
      for (const playlistId of selectedPlaylists) {
        const playlist = playlists.find(p => p.id === playlistId);

        if (!playlist) {
          console.error(`Playlist with ID ${playlistId} not found.`);
          setTransferProgress(prev => [
            ...prev,
            {
              spotifyPlaylistId: playlistId,
              spotifyPlaylistName: 'Unknown',
              status: 'Failed: Playlist not found',
            },
          ]);
          continue;
        }

        let tracks, amazonPlaylistId;
        try {
          // Fetch tracks from Spotify playlist
          tracks = await SpotifyService.getPlaylistTracks(spotifyAuth.accessToken, playlistId);
        } catch (error) {
          console.error(`Error fetching tracks for playlist ${playlist.name}:`, error);
          setTransferProgress(prev => [
            ...prev,
            {
              spotifyPlaylistId: playlistId,
              spotifyPlaylistName: playlist.name,
              status: 'Failed: Error fetching tracks',
            },
          ]);
          continue;
        }

        try {
          // Create a new playlist in Amazon Music
          amazonPlaylistId = await amazonMusicService.createPlaylist(
            amazonAuth.accessToken,
            `Created: ${playlist.name}`
          );
        } catch (error) {
          console.error(`Error creating Amazon playlist for ${playlist.name}:`, error);
          setTransferProgress(prev => [
            ...prev,
            {
              spotifyPlaylistId: playlistId,
              spotifyPlaylistName: playlist.name,
              status: 'Failed: Error creating Amazon playlist',
            },
          ]);
          continue;
        }

        try {
          // Add tracks to the new Amazon Music playlist
          await amazonMusicService.addTracksToPlaylist(
            amazonAuth.accessToken,
            amazonPlaylistId,
            tracks
          );
          setTransferProgress(prev => [
            ...prev,
            {
              spotifyPlaylistId: playlistId,
              spotifyPlaylistName: playlist.name,
              status: 'Transferred Successfully',
            },
          ]);
        } catch (error) {
          console.error(`Error adding tracks to Amazon playlist for ${playlist.name}:`, error);
          setTransferProgress(prev => [
            ...prev,
            {
              spotifyPlaylistId: playlistId,
              spotifyPlaylistName: playlist.name,
              status: 'Failed: Error adding tracks',
            },
          ]);
          continue;
        }
      }

      // Check if all transfers completed successfully
      const allSuccessful = selectedPlaylists.every(playlistId =>
        transferProgress.some(
          progress =>
            progress.spotifyPlaylistId === playlistId && progress.status === 'Transferred Successfully'
        )
      );

      setStep(allSuccessful ? 5 : 3);
    } catch (error) {
      console.error('Unexpected error during transfer process:', error);
      setStep(3);
      alert('Transfer process encountered an unexpected error. Please try again.');
    }

  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="mb-6">
              <Button onClick={spotifyAuth.login} className="mb-4 mr-4">
                Login to Spotify
              </Button>
            </div>
            {spotifyAuth.user && (
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <img
                    src={spotifyAuth.user.images?.[0]?.url || 'https://via.placeholder.com/150'}
                    alt="Spotify Profile"
                    className="w-24 h-24 rounded-full mb-4 object-cover"
                  />
                  <p>Spotify: {spotifyAuth.user.display_name}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <PlaylistSelector
              playlists={playlists}
              selectedPlaylists={selectedPlaylists}
              setSelectedPlaylists={setSelectedPlaylists}
              onPlaylistSelect={handlePlaylistSelect}
              onNext={handleProceedToAmazon}
              onLogout={() => {
                spotifyAuth.logout();
                setStep(1);
              }}
            />
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Amazon Music Login</h2>
            {amazonAuth.isLoggedIn && amazonAuth.userProfile ? < UserProfile />
              :
              < Button onClick={amazonAuth.login} className="mb-4">
                Login to Amazon Music
              </Button>}

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="ml-2"
              >
                Back to Playlist Selection
              </Button>

              <Button
                disabled={!amazonAuth.isLoggedIn}
                onClick={() => handleTransfer()}
                variant="outline"
                className="ml-2"
              >
                Continue with transfer
              </Button>
            </div>
          </div >
        );
      case 4:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Transfer in Progress</h2>
            <p className="text-gray-600 mb-6">Transferring selected playlists...</p>
            {transferProgress.map((transfer, index) => (
              <div key={index} className="mb-2">
                {transfer.spotifyPlaylistName}: {transfer.status}
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Transfer Complete!</h2>
            <p className="text-gray-600 mb-6">Your playlists have been processed.</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setStep(2)} variant="primary">
                Transfer More Playlists
              </Button>
              <Button onClick={() => {
                spotifyAuth.logout();
                amazonAuth.logout();
                setStep(1);
              }} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Music Transfer
            </h1>
            {(spotifyAuth.user || amazonAuth.user) && (
              <Button
                onClick={() => {
                  spotifyAuth.logout();
                  amazonAuth.logout();
                  setStep(1);
                }}
                variant="outline"
                className="text-sm"
              >
                Logout 
              </Button>
            )}
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default App;
