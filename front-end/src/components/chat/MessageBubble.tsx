import React from 'react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isSequential: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSequential }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isSequential ? 'mt-1' : 'mt-4'}`}
      style={{ 
        animationName: 'fadeIn',
        animationDuration: '0.3s',
        animationFillMode: 'both'
      }}
    >
      {!isUser && !isSequential && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 mt-1 shadow-sm text-white">
          <span className="text-xs font-bold">AI</span>
        </div>
      )}
      
      {!isUser && isSequential && <div className="w-8 mr-2"></div>}
      
      <div className={`max-w-[75%] ${isSequential ? '' : ''}`}>
        <div 
          className={`
            px-4 py-2 rounded-2xl break-words
            ${isUser 
              ? 'bg-blue-500 text-white rounded-tr-none shadow-sm' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'}
          `}
        >
          {message.content}
        </div>
        
        {!isSequential && (
          <div className={`flex items-center mt-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-gray-400 dark:text-gray-500">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
      
      {isUser && !isSequential && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 mt-1 shadow-sm text-white">
          <span className="text-xs font-bold">You</span>
        </div>
      )}
      
      {isUser && isSequential && <div className="w-8 ml-2"></div>}
    </div>
  );
};

const formatMessageTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default MessageBubble;