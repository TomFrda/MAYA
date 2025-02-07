import React from 'react';
import { Profile } from '../../types/api';
import { MapPinIcon } from '@heroicons/react/24/solid';

interface MatchInfoProps {
  match: Profile;
}

const MatchInfo: React.FC<MatchInfoProps> = ({ match }) => {
  return (
    <>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {match.first_name}
      </h3>
      
      <p className="text-gray-600 mb-2">
        {match.age} ans
      </p>

      <div className="flex items-center text-gray-500 mb-2">
        <MapPinIcon className="w-4 h-4 mr-1" />
        {match.city || "À proximité"}
        {match.isOnline && (
          <span className="ml-2 text-green-500 text-sm">• En ligne</span>
        )}
      </div>

      <p className="text-gray-500 mb-3 line-clamp-3">
        {match.bio || "Aucune bio pour le moment"}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {match.interests?.map((interest, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
          >
            {interest}
          </span>
        ))}
      </div>

      {match.distance && (
        <p className="text-sm text-gray-400 mb-3">
          À {Math.round(match.distance)}km
        </p>
      )}
    </>
  );
};

export default MatchInfo;