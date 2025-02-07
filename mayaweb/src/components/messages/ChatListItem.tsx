import React from 'react';
import { Chat } from '../../types/api';
import { formatLastActive } from '../../utils/dateUtils';

interface ChatListItemProps {
  chat: Chat;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onClick }) => {
  return (
    <div
      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={`http://localhost:5000/uploads/${chat.profilePhoto}`}
          alt={chat.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        {chat.hasNewMessage && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <h3 className="font-semibold">{chat.firstName}</h3>
        <p className="text-sm text-gray-500">
          {chat.lastMessage?.content || 'Aucun message'}
        </p>
        {!chat.isOnline && (
          <p className="text-xs text-gray-400">
            {formatLastActive(chat.lastActive)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;