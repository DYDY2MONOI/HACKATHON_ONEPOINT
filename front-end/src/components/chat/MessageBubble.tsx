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
            {part} {/* Display the URL as the link text */}
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
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 mt-1 shadow-sm text-white shrink-0"> {/* Added shrink-0 */}
          <span className="text-xs font-bold">🤖</span>
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
          {/* Use the helper function to render the content */}
          {renderContentWithLinks(message.content)}
        </div>

        {/* --- Timestamp Logic (No Change) --- */}
        {!isSequential && (
          <div className={`flex items-center mt-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-gray-400 dark:text-gray-500">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
      {isUser && !isSequential && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1 shadow-sm text-gray-700 shrink-0"> {/* Changed color, Added shrink-0 */}
          <span className="text-xs font-bold">You</span>
        </div>
      )}
      {isUser && isSequential && <div className="w-8 ml-2 shrink-0"></div>}
    </div>
  );
};

const formatMessageTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }); // Example: 4:30 PM
};

export default MessageBubble;
