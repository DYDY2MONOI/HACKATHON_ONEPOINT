import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, Conversation } from '../types';

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  activeConversation: string | null;
  isTyping: boolean;
  addMessage: (content: string, sender: 'user' | 'bot') => void;
  setActiveConversation: (id: string) => void;
  startNewConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Getting Started',
      lastMessage: 'How can I help you today?',
      timestamp: new Date(),
      unread: false,
    },
    {
      id: '2',
      title: 'Project Ideas',
      lastMessage: 'What kind of project would you like to build?',
      timestamp: new Date(Date.now() - 3600000),
      unread: false,
    },
    {
      id: '3',
      title: 'Technical Support',
      lastMessage: 'Have you tried restarting your device?',
      timestamp: new Date(Date.now() - 86400000),
      unread: false,
    },
  ]);
  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
  };

  const startNewConversation = () => {
    const newId = (conversations.length + 1).toString();
    const newConversation: Conversation = {
      id: newId,
      title: `New Chat ${newId}`,
      lastMessage: 'How can I help you?',
      timestamp: new Date(),
      unread: false,
    };
    
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newId);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversations,
        activeConversation,
        isTyping,
        addMessage,
        setActiveConversation,
        startNewConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};