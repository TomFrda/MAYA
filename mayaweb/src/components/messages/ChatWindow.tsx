import React from 'react';
import { Message, Chat } from '../../types/api'; // Add Chat import
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: string;
  onSendMessage: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSendMedia: (url: string, type: 'gif' | 'sticker') => void;
  chat?: Chat; // Add this prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  onSendMedia,
  chat
}) => {
  return (
    <div className="col-span-2 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwnMessage={message.from === currentUserId}
            onDelete={() => onDeleteMessage(message._id)}
            senderPhoto={message.from !== currentUserId ? chat?.profilePhoto : undefined} // Fix comparison
            senderName={chat?.firstName}
          />
        ))}
      </div>
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={onSendMessage}
          onSendMedia={onSendMedia}
        />
      </div>
    </div>
  );
};

export default ChatWindow;