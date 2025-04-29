import React from 'react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messageEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, messageEndRef }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4 shadow-lg text-white">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to OnePoint GenAI Eco</h3>
        <p className="text-gray-600 max-w-md mb-6">
          Start a conversation by typing a message below. I'm here to help with any questions you might have.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-lg">
          {[
            "How does this work?",
            "What can you help me with?",
            "Tell me a joke",
            "What's the weather today?"
          ].map((suggestion, index) => (
            <button 
              key={index}
              className="px-4 py-2 text-sm bg-white rounded-lg hover:bg-gray-100 transition-all text-gray-700 text-left border border-gray-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-white">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isSequential={
            index > 0 && 
            messages[index - 1].sender === message.sender &&
            new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 60000
          } 
        />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageList;