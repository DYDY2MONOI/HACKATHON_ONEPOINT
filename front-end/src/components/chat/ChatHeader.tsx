import React from 'react';
import { Info } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface ChatHeaderProps {
  title: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  const { t } = useSettings();
  
  return (
    <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <span className="font-semibold">🤖</span>
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('online')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" aria-label="Info">
            <Info size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;