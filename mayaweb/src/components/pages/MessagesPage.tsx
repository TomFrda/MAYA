import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getChats, getMessages, sendMessage, markMessagesAsRead, deleteMessage } from '../../services/apiService';
import { Message, Chat, UserStatus } from '../../types/api';
import io from 'socket.io-client';
import ChatList from '../messages/ChatList';
import ChatWindow from '../messages/ChatWindow';

const MessagesPage: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSendMessage = async (content: string) => {
    if (selectedChat && token && content.trim()) {
      try {
        await sendMessage(token, selectedChat, content);
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

  // Socket connection
  useEffect(() => {
    if (!token || !user) return;

    const socket = io('http://localhost:5000');
    socket.emit('register', user.id);

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
          <ChatList 
            chats={chats}
            onChatSelect={handleChatSelect}
          />
          {selectedChat ? (
            <ChatWindow
              messages={messages}
              currentUserId={user?.id}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onSendMedia={handleSendMedia}
              chat={chats.find(chat => chat.userId === selectedChat)}
            />
          ) : (
            <div className="col-span-2 h-full flex items-center justify-center">
              <p className="text-gray-500">
                Sélectionnez une conversation pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;