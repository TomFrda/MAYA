import React from 'react';
import { Profile } from '../../types/api';
import { MapPinIcon, ChatBubbleLeftIcon, XCircleIcon } from '@heroicons/react/24/solid';
import MatchPhoto from './MatchPhoto';
import MatchInfo from './MatchInfo';
import MatchActions from './MatchActions';

interface MatchCardProps {
  match: Profile;
  onMessageClick: (id: string) => void;
  onUnmatch: (id: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onMessageClick, onUnmatch }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
      <MatchPhoto photos={match.profilePhotos} firstName={match.first_name} />
      <div className="p-4">
        <MatchInfo match={match} />
        <MatchActions 
          matchId={match.id} 
          onMessageClick={onMessageClick} 
          onUnmatch={onUnmatch}
        />
      </div>
    </div>
  );
};

export default MatchCard;