import React from 'react';
import Button from './Button';

const PlaylistSelector = ({
    playlists,
    selectedPlaylists,
    setSelectedPlaylists,
    onNext
}) => {

    const handlePlaylistSelect = (playlistId) => {
        setSelectedPlaylists(prev =>
            prev.includes(playlistId)
                ? prev.filter(id => id !== playlistId)
                : [...prev, playlistId]
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select Playlists to Transfer</h2>
            </div>

            {/* Playlists */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer 
              transition-colors duration-200 
              ${selectedPlaylists.includes(playlist.id)
                                ? 'bg-blue-50 border-blue-300'
                                : 'hover:bg-gray-100 border-gray-200'}`}
                        onClick={() => handlePlaylistSelect(playlist.id)}
                    >
                        {/* Checkbox */}
                        <input
                            onClick={(e) => e.stopPropagation()}
                            type="checkbox"
                            checked={selectedPlaylists.includes(playlist.id)}
                            onChange={() => handlePlaylistSelect(playlist.id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        {/* Playlist Image */}
                        <img
                            src={playlist.images?.[0]?.url || 'https://via.placeholder.com/50'}
                            alt={playlist.name}
                            className="w-10 h-10 mr-3 rounded object-cover"
                        />
                        {/* Playlist Info */}
                        <div className="flex-grow truncate">
                            <span className="font-semibold text-sm truncate">{playlist.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                                ({playlist.tracks.total} track{playlist.tracks.total !== 1 ? 's' : ''})
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                                by {playlist.owner.display_name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transfer Button */}
            <div className="mt-6 flex justify-center">
                <Button
                    onClick={onNext}
                    disabled={selectedPlaylists.length === 0}
                    className="w-full max-w-md"
                    variant={selectedPlaylists.length > 0 ? 'primary' : 'secondary'}
                >
                    Transfer {selectedPlaylists.length} Playlist{selectedPlaylists.length !== 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
};

export default PlaylistSelector;
