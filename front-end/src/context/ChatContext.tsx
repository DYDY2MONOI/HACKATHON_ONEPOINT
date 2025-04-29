import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// Keys for localStorage
const STORAGE_KEYS = {
  MESSAGES: 'onepoint_chat_messages',
  CONVERSATIONS: 'onepoint_chat_conversations',
  ACTIVE_CONVERSATION: 'onepoint_active_conversation',
};

// Helper to parse JSON from localStorage with date handling
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    // Parse JSON and convert date strings back to Date objects for timestamps
    const data = JSON.parse(stored, (key, value) => {
      if (key === 'timestamp' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
    
    return data;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [messages, setMessages] = useState<Message[]>(() => 
    getStoredData(STORAGE_KEYS.MESSAGES, [])
  );
  
  const [conversations, setConversations] = useState<Conversation[]>(() => 
    getStoredData(STORAGE_KEYS.CONVERSATIONS, [
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
    ])
  );
  
  const [activeConversation, setActiveConversation] = useState<string | null>(() => 
    getStoredData(STORAGE_KEYS.ACTIVE_CONVERSATION, '1')
  );
  
  const [isTyping, setIsTyping] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, JSON.stringify(activeConversation));
  }, [activeConversation]);

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Update conversation's last message
    if (activeConversation) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { 
                ...conv, 
                lastMessage: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                timestamp: new Date()
              } 
            : conv
        )
      );
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
    setMessages([]); // Clear messages for new conversation
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
    
    // Load messages for this conversation (in a real app, you'd fetch them)
    // Here we're simulating the behavior since we don't have conversation-specific messages yet
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