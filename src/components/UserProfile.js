import React from 'react';
import { useAmazonLogin } from '../contexts/AmazonLoginProvider';

export function UserProfile() {
  const { isLoggedIn, userProfile, logout } = useAmazonLogin();

  if (!isLoggedIn || !userProfile) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm mx-auto text-center">
      <img
        src={`https://via.placeholder.com/100?text=${userProfile.name.charAt(0)}`}
        alt={`${userProfile.name}'s profile`}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Welcome, {userProfile.name}!
      </h2>
      <p className="text-sm text-gray-600 mb-4">Email: {userProfile.email}</p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
