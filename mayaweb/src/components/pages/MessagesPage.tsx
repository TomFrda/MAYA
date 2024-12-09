import React, { useState } from 'react';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { from: 'Alice', content: 'Hello!' },
    { from: 'Bob', content: 'Hi there!' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { from: 'You', content: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Messages</h1>
      <div className="w-full max-w-md p-4 border rounded shadow mb-4">
        <div className="mb-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2">
              <strong>{message.from}:</strong> {message.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-2 border rounded-l"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="btn btn-primary rounded-r"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;