import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { updateUserProfile, uploadProfilePhoto } from '../../services/apiService';

const ProfilePage: React.FC = () => {
  const { token, userInfo, login } = useContext(AuthContext);
  const [bio, setBio] = useState(userInfo?.bio || '');
  const [maxDistance, setMaxDistance] = useState(userInfo?.maxDistance || 50);
  const [latitude, setLatitude] = useState(userInfo?.location.coordinates[1] || 0);
  const [longitude, setLongitude] = useState(userInfo?.location.coordinates[0] || 0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (photo) {
        await uploadProfilePhoto(token!, photo);
      }
      const updatedUser = await updateUserProfile(token!, { 
        bio, 
        maxDistance,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      });
      if (token) {
        login(token, updatedUser);
      } else {
        setError('Token is missing');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-purple-500">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Profile</h2>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Max Distance (km)</label>
                <input
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button 
                type="submit"
                className="w-full py-3 text-white transition-all bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:opacity-90"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;