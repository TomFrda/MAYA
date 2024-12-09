import React, { useEffect, useState, useContext } from 'react';
import { getUserInfo } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (authContext?.token) {
        try {
          const data = await getUserInfo(authContext.token);
          setUserInfo(data);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [authContext?.token]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>
      <div className="w-full max-w-md p-4 border rounded shadow">
        <img src={userInfo.profilePhoto || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-48 object-cover rounded mb-4" />
        <h2 className="text-2xl font-bold">{userInfo.first_name}</h2>
        <p className="text-gray-700">Age: {userInfo.age}</p>
        <p className="text-gray-700">Bio: {userInfo.bio}</p>
        <p className="text-gray-700">Email: {userInfo.email}</p>
        <p className="text-gray-700">Phone Number: {userInfo.phone_number}</p>
      </div>
    </div>
  );
};

export default ProfilePage;