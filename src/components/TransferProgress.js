import React from 'react';

const TransferProgress = ({ current, total, currentPlaylist }) => {
    const progress = (current / total) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Transferring: {currentPlaylist}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <h1>{progress}</h1>
        </div>
    );
};

export default TransferProgress;
