import axios from 'axios';

class AmazonMusicService {
    async createPlaylist(accessToken, playlistName) {
        try {

            const response = await axios.post(
                'https://api.music.amazon.dev/v1/playlists',
                {
                    title: playlistName,
                    "description": "Amazing Songs",
                    "visibility": "PRIVATE"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.id;
        } catch (error) {
            console.error('Error creating playlist:', error);
            throw error;
        }
    }

    static async addTracksToPlaylist(accessToken, playlistId, tracks) {
        try {

            const formattedTracks = tracks.map(track => ({
                uri: track.uri,
                title: track.name,
                artist: track.artists[0].name
            }));

            const response = await axios.post(
                `https://api.music.amazon.dev/v1/playlists/${playlistId}/tracks`,
                { tracks: formattedTracks },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error adding tracks to playlist:', error);
            throw error;
        }
    }

    static async getUserProfile(accessToken) {
        try {
            const response = await axios.get(
                'https://api.music.amazon.dev/v1/me',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    static async searchTrack(accessToken, track) {
        try {
            const response = await axios.get(
                'https://api.music.amazon.dev/v1/search',
                {
                    params: {
                        q: `${track.name} ${track.artists[0].name}`,
                        type: 'track'
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return response.data.tracks.items[0]; // Return first matching track
        } catch (error) {
            console.error('Error searching for track:', error);
            throw error;
        }
    }

    // Error handling method for common Amazon Music API errors
    static handleApiError(error) {
        if (error.response) {

            switch (error.response.status) {
                case 401:
                    return 'Authorization failed. Please re-authenticate.';
                case 403:
                    return 'Access forbidden. Check your permissions.';
                case 429:
                    return 'Too many requests. Please wait and try again.';
                default:
                    return `An error occurred: ${error.response.status}`;
            }
        } else if (error.request) {
            // The request was made but no response was received
            return 'No response from Amazon Music. Check your internet connection.';
        } else {
            return 'Error setting up the request.';
        }
    }
}

export default AmazonMusicService;