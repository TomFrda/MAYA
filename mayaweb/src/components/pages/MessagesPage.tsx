import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getChats, getMessages, sendMessage, markMessagesAsRead, deleteMessage } from '../../services/apiService';
import { Message, Chat } from '../../types/api';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import GifPicker from '../layout/GifPicker';

interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastActive: string | Date;
}

const MessagesPage = () => {
  const { token, user } = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const chatId = new URLSearchParams(location.search).get('chatId');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaType, setMediaType] = useState<'gif' | 'sticker' | null>(null);

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

  const handleSendMedia = async (mediaUrl: string, type: 'gif' | 'sticker') => {
    if (selectedChat && token) {
      try {
        await sendMessage(token, selectedChat, mediaUrl, type);
        setShowMediaPicker(false);
        const messagesData = await getMessages(token, selectedChat);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error sending media:', error);
      }
    }
  };

  const handleChatSelect = async (chatId: string) => {
    setSelectedChat(chatId);
    if (token) {
      try {
        await markMessagesAsRead(token, chatId);
        // Mettre à jour l'état des chats pour enlever la pastille
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.userId === chatId 
              ? { ...chat, hasNewMessage: false }
              : chat
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (token) {
      try {
        await deleteMessage(token, messageId);
        setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    // Connexion au socket
    const socket = io('http://localhost:5000');
    
    // Enregistrement de l'utilisateur
    socket.emit('register', user.id);

    // Écouter les changements de statut
    socket.on('userStatusChanged', ({ userId, isOnline, lastActive }: UserStatus) => {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.userId === userId 
            ? { ...chat, isOnline, lastActive: new Date(lastActive) }
            : chat
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

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
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer relative" // Ajout de relative
                  onClick={() => handleChatSelect(chat.userId)}
                >
                  <div className="relative"> {/* Conteneur pour l'image et la pastille */}
                    <img 
                      src={`http://localhost:5000/uploads/${chat.profilePhoto}`}
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover shadow-sm border border-gray-200"
                    />
                    {chat.hasNewMessage && ( // Changement de isOnline à hasNewMessage
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    )}
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{chat.firstName}</h3>
                    <p className="text-sm text-gray-500">
                      {chat.lastMessage?.content}
                    </p>
                    {!chat.isOnline && (
                      <p className="text-xs text-gray-400">
                        {formatLastActive(chat.lastActive)}
                      </p>
                    )}
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
                      <div className="max-w-[60%] relative group">
                        <div
                          className={`p-3 rounded-lg ${
                            message.from === user?.id
                              ? 'bg-pink-500 text-white rounded-tr-none'
                              : 'bg-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {message.type === 'gif' || message.content.includes('giphy.com') ? (
                            <img 
                              src={message.content} 
                              alt="GIF" 
                              className="rounded-lg max-w-full w-64 h-64 object-cover"
                            />
                          ) : (
                            <div className="whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                          )}
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
                    <button
                      onClick={() => {
                        setMediaType('sticker');
                        setShowMediaPicker(true);
                      }}
                      className="p-2 text-gray-500 hover:text-pink-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    onClick={handleSendMessage}
                  >
                    Envoyer
                  </button>

                  {/* Modal pour le sélecteur de GIFs/stickers */}
                  {showMediaPicker && mediaType === 'gif' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-4 rounded-lg w-96">
                        <div className="flex justify-between mb-4">
                          <h3 className="text-lg font-semibold">Sélectionner un GIF</h3>
                          <button onClick={() => setShowMediaPicker(false)}>×</button>
                        </div>
                        <GifPicker onSelect={(gifUrl) => {
                          handleSendMedia(gifUrl, 'gif');
                          setShowMediaPicker(false);
                        }} />
                      </div>
                    </div>
                  )}
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

const formatLastActive = (lastActive?: Date) => {
  if (!lastActive) return '';
  
  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diffInSeconds = Math.floor((now.getTime() - lastActiveDate.getTime()) / 1000);

  if (diffInSeconds < 30) return "En ligne";
  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
};

export default MessagesPage;