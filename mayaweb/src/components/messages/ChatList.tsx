import React from 'react';
import { Chat } from '../../types/api';
import ChatListItem from './ChatListItem';

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onChatSelect }) => {
  return (
    <div className="col-span-1 border-r">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        {chats.map((chat) => (
          <ChatListItem 
            key={chat.userId}
            chat={chat}
            onClick={() => onChatSelect(chat.userId)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;