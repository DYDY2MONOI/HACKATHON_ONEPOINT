import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { PlusCircle, Search, MessageSquare, Settings, User } from 'lucide-react';
import SettingsModal from '../ui/SettingsModal';
import { useSettings } from '../../context/SettingsContext';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { conversations, activeConversation, setActiveConversation, startNewConversation } = useChatContext();
  const { t } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const filteredConversations = conversations.filter(
    (conv) => conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (id: string) => {
    setActiveConversation(id);
    onClose();
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <MessageSquare size={20} className="text-blue-500 mr-2" />
            <span>OnePoint GenAI - Eco</span>
          </h1>
        </div>
        
        <div className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
          />
          <input
            type="text"
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-700 pl-10 pr-4 py-2 rounded-md text-sm 
            border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 
            focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 
            dark:placeholder-gray-500 transition-all"
          />
        </div>
      </div>
      
      <button
        onClick={startNewConversation}
        className="mx-4 mt-4 mb-2 py-2 px-4 rounded-md flex items-center justify-center 
        bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <PlusCircle size={18} className="mr-2" />
        <span className="font-medium">{t('newChat')}</span>
      </button>
      
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`
                mx-2 mb-1 px-4 py-3 rounded-md cursor-pointer transition-all
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${activeConversation === conversation.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">
                    {conversation.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(conversation.timestamp)}
                  </span>
                  {conversation.unread && (
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500">
            {t('noConversations')}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('freePlan')}</p>
            </div>
          </div>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            onClick={toggleSettingsModal}
          >
            <Settings size={18} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default Sidebar;