import React, { useState } from 'react';
import GifPicker from '../layout/GifPicker';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendMedia: (url: string, type: 'gif' | 'sticker') => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendMedia }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaType, setMediaType] = useState<'gif' | 'sticker' | null>(null);

  return (
    <div className="flex gap-2">
      <div className="flex-1 flex gap-2">
        <button
          onClick={() => {
            setMediaType('gif');
            setShowMediaPicker(true);
          }}
          className="p-2 text-gray-500 hover:text-pink-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Écrivez votre message..."
        />
      </div>
      <button
        className="px-4 py-2 bg-pink-500 text-white rounded-lg"
        onClick={() => {
          if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
          }
        }}
      >
        Envoyer
      </button>

      {showMediaPicker && mediaType === 'gif' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-96">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Sélectionner un GIF</h3>
              <button onClick={() => setShowMediaPicker(false)}>×</button>
            </div>
            <GifPicker onSelect={(gifUrl) => {
              onSendMedia(gifUrl, 'gif');
              setShowMediaPicker(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;