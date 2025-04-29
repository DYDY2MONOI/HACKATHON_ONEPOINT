import React from 'react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useSettings } from '../../context/SettingsContext';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messageEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, messageEndRef }) => {
  const { t } = useSettings();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50 dark:bg-gray-800">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-4 shadow-lg text-white">
          <span className="text-2xl">👋</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('welcome')}</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
          {t('startConversation')}
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-lg">
          {[
            'howDoesThisWork',
            'whatCanYouHelp',
            'tellJoke',
            'weatherToday'
          ].map((suggestionKey, index) => (
            <button 
              key={index}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 
              dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200 text-left 
              border border-gray-200 dark:border-gray-600"
            >
              {t(suggestionKey)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900 scrollbar-thin">
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