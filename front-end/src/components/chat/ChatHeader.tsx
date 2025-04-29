import React from 'react';
import { Info } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  return (
    <div className="py-3 px-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <span className="font-semibold">🤖</span>
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900">{title}</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-all" aria-label="Info">
            <Info size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;