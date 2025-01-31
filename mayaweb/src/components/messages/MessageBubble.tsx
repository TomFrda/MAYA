import React from 'react';
import { Message } from '../../types/api';
import { TrashIcon } from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onDelete: () => void;
  senderPhoto?: string;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onDelete,
  senderPhoto,
  senderName
}) => {
  return (
    <div className={`mb-4 flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && senderPhoto && (
        <div className="flex flex-col items-center mr-2">
          <img 
            src={`http://localhost:5000/uploads/${senderPhoto}`}
            alt={senderName}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      )}
      
      <div className="max-w-[60%] relative group">
        <div
          className={`p-3 rounded-lg ${
            isOwnMessage
              ? 'bg-pink-500 text-white rounded-tr-none'
              : 'bg-gray-200 text-gray-800 rounded-tl-none'
          }`}
        >
          {(message.type === 'gif' || message.content.includes('giphy.com')) ? (
            <img 
              src={message.content} 
              alt="GIF"
              className="rounded-lg max-w-full h-auto"
            />
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {isOwnMessage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
                  onDelete();
                }
              }}
              className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Supprimer le message"
            >
              <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
            </button>
          )}
        </div>
        <span className={`text-xs text-gray-500 mt-1 ${
          isOwnMessage ? 'text-right' : 'text-left'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;