import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getChats, getMessages, sendMessage } from '../../services/apiService';

interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: Date;
}

interface Chat {
  userId: string;
  firstName: string;
  profilePhoto: string;
  lastMessage?: Message;
}

const MessagesPage = () => {
  const { token, user } = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const chatId = new URLSearchParams(location.search).get('chatId');

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      if (token) {
        try {
          const chatsData = await getChats(token);
          setChats(chatsData);
        } catch (error) {
          console.error('Error loading chats:', error);
        }
      }
    };
    loadChats();
  }, [token]);

  // Set selected chat from URL
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [chatId]);

  // Load messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedChat && token) {
        try {
          const messagesData = await getMessages(token, selectedChat);
          setMessages(messagesData);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      }
    };
    loadMessages();
  }, [selectedChat, token]);

  // Handle sending new message
  const handleSendMessage = async () => {
    if (selectedChat && token && newMessage.trim()) {
      try {
        await sendMessage(token, selectedChat, newMessage);
        setNewMessage('');
        // Reload messages after sending
        const messagesData = await getMessages(token, selectedChat);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-3 gap-4 bg-white rounded-lg shadow-lg">
          {/* Liste des conversations */}
          <div className="col-span-1 border-r">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Messages</h2>
              {chats.map((chat) => (
                <div
                  key={chat.userId}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedChat(chat.userId)}
                >
                    <img 
                    src={`http://localhost:5000/uploads/${chat.profilePhoto}`}
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover shadow-sm border border-gray-200"
                    />
                  <div className="ml-3">
                    <h3 className="font-semibold">{chat.firstName}</h3>
                    <p className="text-sm text-gray-500">
                      {chat.lastMessage?.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="col-span-2 p-4">
            {selectedChat ? (
              <>
                <div className="h-[calc(100vh-240px)] overflow-y-auto mb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex items-end ${
                        message.from === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.from !== user?.id && (
                        <div className="flex flex-col items-center mr-2">
                          <img 
                            src={`http://localhost:5000/uploads/${chats.find(chat => chat.userId === message.from)?.profilePhoto}`}
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
                          />
                          <span className="text-xs text-gray-500">
                            {chats.find(chat => chat.userId === message.from)?.firstName}
                          </span>
                        </div>
                      )}
                      <div className="max-w-[60%] relative">
                        <div
                          className={`p-3 rounded-lg ${
                            message.from === user?.id
                              ? 'bg-pink-500 text-white rounded-tr-none'
                              : 'bg-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className={`text-xs text-gray-500 mt-1 ${
                          message.from === user?.id ? 'text-right' : 'text-left'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {message.from === user?.id && (
                        <div className="flex flex-col items-center ml-2">
                            <img 
                            src={`http://localhost:5000/uploads/${user?.profilePhotos?.[0]}`}
                            alt="Your Profile" 
                            className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
                            />
                          <span className="text-xs text-gray-500">Vous</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Écrivez votre message..."
                  />
                  <button
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg"
                    onClick={handleSendMessage}
                  >
                    Envoyer
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">
                  Sélectionnez une conversation pour commencer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;