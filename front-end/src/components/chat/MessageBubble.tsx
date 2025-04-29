import React from 'react';
import { Message } from '../../types';

const renderContentWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  const isUrlRegex = /^https?:\/\/[^\s]+$/;

  return parts
    .filter(part => part)
    .map((part, index) => {
      if (isUrlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      } else {
        return <React.Fragment key={index}>{part}</React.Fragment>;
      }
    });
};

interface MessageBubbleProps {
  message: Message;
  isSequential: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSequential }) => {
  const isUser = message.sender === 'user';

  const calculateCO2Emissions = (): number => {
    if (isUser) return 0;
    return message.content.length * 0.00125;
  };

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
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 mt-1 shadow-sm text-white shrink-0">
          <span className="text-xs font-bold">AI</span>
        </div>
      )}
      {!isUser && isSequential && <div className="w-8 mr-2 shrink-0"></div>}
      <div className={`max-w-[75%] ${isSequential ? '' : ''}`}>
        <div
          className={`
            px-4 py-2 rounded-2xl break-words
            ${isUser
              ? 'bg-blue-500 text-white rounded-tr-none shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'}
          `}
        >
          {renderContentWithLinks(message.content)}
        </div>

        {!isUser && (
          <div className="flex items-start mt-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {calculateCO2Emissions().toFixed(5)}g CO2
            </span>
          </div>
        )}

        {!isSequential && (
          <div className={`flex items-center mt-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-gray-400 dark:text-gray-500">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
      {isUser && !isSequential && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1 shadow-sm text-gray-700 shrink-0">
          <span className="text-xs font-bold">You</span>
        </div>
      )}
      {isUser && isSequential && <div className="w-8 ml-2 shrink-0"></div>}
    </div>
  );
};

const formatMessageTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }); 
};

export default MessageBubble;