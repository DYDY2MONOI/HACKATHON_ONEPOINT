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
      unread: true,
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
    
    if (sender === 'user') {
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getBotResponse(content),
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
        
        if (activeConversation) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeConversation
                ? { ...conv, lastMessage: botResponse.content, timestamp: new Date() }
                : conv
            )
          );
        }
      }, 1500);
    }
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

  const setActiveConversationWithRead = (id: string) => {
    setActiveConversation(id);
    
    // Mark the conversation as read when it becomes active
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, unread: false } 
          : conv
      )
    );
  };

  const getBotResponse = (message: string): string => {
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! How can I assist you today?';
    } else if (message.includes('help')) {
      return 'I can help you with information, answer questions, or just chat. What would you like to know?';
    } else if (message.includes('thanks') || message.includes('thank you')) {
      return "You're welcome! Is there anything else you'd like help with?";
    } else if (message.includes('bye')) {
      return 'Goodbye! Feel free to return if you have more questions.';
    } else if (message.includes('how does this work')) {
      return 'This is a chat interface where you can ask questions and get responses. Just type your message and I\'ll do my best to help!';
    } else if (message.includes('what can you help me with')) {
      return 'I can help with answering questions, providing information, brainstorming ideas, discussing topics, or just having a friendly chat!';
    } else if (message.includes('tell me a joke') || message.includes('joke')) {
      return 'Why don\'t scientists trust atoms? Because they make up everything!';
    } else if (message.includes('weather') || message.includes('weather today')) {
      return 'I don\'t have access to real-time weather data, but I can suggest checking a weather service or looking outside your window for the most current conditions!';
    } else {
      return "I understand you want to discuss that. Could you provide more details so I can better assist you?";
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversations,
        activeConversation,
        isTyping,
        addMessage,
        setActiveConversation: setActiveConversationWithRead,
        startNewConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};