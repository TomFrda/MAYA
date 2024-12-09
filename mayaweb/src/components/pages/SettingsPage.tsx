import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationsChange = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleDarkModeChange = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <div className="w-full max-w-md p-4 border rounded shadow mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notifications
          </label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationsChange}
            className="mr-2 leading-tight"
          />
          <span className="text-gray-700">Enable Notifications</span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Dark Mode
          </label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeChange}
            className="mr-2 leading-tight"
          />
          <span className="text-gray-700">Enable Dark Mode</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;