import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatContainer: React.FC = () => {
  const { messages, addMessage, isTyping, activeConversation, conversations } = useChatContext();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const activeChat = conversations.find(c => c.id === activeConversation);
  const chatTitle = activeChat?.title || 'New Chat';

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      addMessage(content, 'user');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ChatHeader title={chatTitle} />
      
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isTyping={isTyping} messageEndRef={messageEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;