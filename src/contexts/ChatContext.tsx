import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chat, ChatMessage } from '@/types/chat';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  currentChatId: string | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  clearChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('gradus-chats');
    const savedCurrentChatId = localStorage.getItem('gradus-current-chat');

    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats(parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Failed to load saved chats:', error);
      }
    }

    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('gradus-chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save current chat ID
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('gradus-current-chat', currentChatId);
    }
  }, [currentChatId]);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'current-user' // This would come from auth context
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));

    // If deleting current chat, select another one
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        setCurrentChatId(null);
      }
    }
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, title, updatedAt: new Date() }
        : chat
    ));
  };

  const addMessage = (chatId: string, message: ChatMessage) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: [...chat.messages, message],
            updatedAt: new Date()
          }
        : chat
    ));

    // Auto-generate title from first user message if chat is untitled
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.title === 'New Chat' && message.sender === 'user' && chat.messages.length === 0) {
      const title = message.content.length > 50
        ? message.content.substring(0, 50) + '...'
        : message.content;
      updateChatTitle(chatId, title);
    }
  };

  const updateMessage = (chatId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, ...updates, updatedAt: new Date() }
                : msg
            ),
            updatedAt: new Date()
          }
        : chat
    ));
  };

  const deleteMessage = (chatId: string, messageId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: chat.messages.filter(msg => msg.id !== messageId),
            updatedAt: new Date()
          }
        : chat
    ));
  };

  const clearChat = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            messages: [],
            updatedAt: new Date()
          }
        : chat
    ));
  };

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      currentChatId,
      createNewChat,
      selectChat,
      deleteChat,
      updateChatTitle,
      addMessage,
      updateMessage,
      deleteMessage,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
