import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useSettings } from '../../context/SettingsContext';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean; 
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const { t } = useSettings();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) { 
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");

      if (inputRef.current) {
        inputRef.current.style.height = "auto"; 
        inputRef.current.style.height = "44px"; 
      }

      setTimeout(() => {
        if (!disabled) {
          inputRef.current?.focus();
        }
      }, 10);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px"; 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center">
          <div className="flex-1 mx-2 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 pr-12
               focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100
               placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-36 transition-all
               border border-gray-200 dark:border-gray-700"
              rows={1}
              style={{ minHeight: "44px" }}
              disabled={disabled} 
            />
          </div>

          <button
            type="submit"
            className={`
              p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-all 
              shadow-sm text-white
              ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}
            `}
            aria-label="Send message"
            disabled={disabled}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;