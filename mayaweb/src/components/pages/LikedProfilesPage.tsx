import React from 'react';

const LikedProfilesPage: React.FC = () => {
  // Sample data for liked profiles
  const likedProfiles = [
    { name: 'Alice', age: 25, photo: 'https://via.placeholder.com/150' },
    { name: 'Bob', age: 30, photo: 'https://via.placeholder.com/150' },
    { name: 'Charlie', age: 28, photo: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Liked Profiles</h1>
      <div className="w-full max-w-md">
        {likedProfiles.map((profile, index) => (
          <div key={index} className="mb-4 p-4 border rounded shadow">
            <img src={profile.photo} alt={profile.name} className="w-full h-48 object-cover rounded mb-4" />
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-700">Age: {profile.age}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedProfilesPage;