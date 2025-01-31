import React from 'react';
import { ChatBubbleLeftIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface MatchActionsProps {
  matchId: string;
  onMessageClick: (id: string) => void;
  onUnmatch: (id: string) => void;
}

const MatchActions: React.FC<MatchActionsProps> = ({ matchId, onMessageClick, onUnmatch }) => {
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => onMessageClick(matchId)}
        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
      >
        <span className="flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
          Message
        </span>
      </button>
      <button
        onClick={() => onUnmatch(matchId)}
        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
        title="Supprimer le match"
      >
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MatchActions;