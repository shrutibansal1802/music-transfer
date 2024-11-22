class SpotifyService {

    constructor() {
        console.log(process.env.REACT_APP_SPOTIFY_REDIRECT_URI);
        this.clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
        this.redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    }

    getAuthUrl() {
        const scopes = [
            'playlist-read-private',
            'playlist-read-collaborative',
            'user-read-private',
            'user-read-email'
        ].join('%20');

        return `https://accounts.spotify.com/authorize?` +
            `client_id=${this.clientId}` +
            `&response_type=token` +
            `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
            `&scope=${scopes}` +
            `&show_dialog=true`;
    }

    // Parse access token from URL hash
    handleSpotifyCallback() {
        const hash = window.location.hash
            .substring(1)
            .split('&')
            .reduce((initial, item) => {
                let parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
                return initial;
            }, {});

        return {
            accessToken: hash.access_token,
            expiresIn: hash.expires_in,
        };
    }

    // Fetch user playlists using access token
    async getUserPlaylists(accessToken) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch playlists');
            }

            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error fetching Spotify playlists:', error);
            throw error;
        }
    }

    // Fetch tracks for a specific playlist
    async getPlaylistTracks(accessToken, playlistId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch playlist tracks');
            }

            const data = await response.json();
            return data.items.map(item => ({
                name: item.track.name,
                artist: item.track.artists[0].name,
                uri: item.track.uri
            }));
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            throw error;
        }
    }
}

export default new SpotifyService();