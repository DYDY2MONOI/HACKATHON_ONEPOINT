import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useSettings } from '../../context/SettingsContext';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean; // Add disabled prop
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const { t } = useSettings();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) { // Only focus if not disabled
      inputRef.current.focus();
    }
  }, [disabled]); // Refocus when enabled

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) { // Check disabled state
      onSendMessage(message);
      setMessage("");

      // Reset textarea height after sending
      if (inputRef.current) {
        inputRef.current.style.height = "auto"; // Reset first
        inputRef.current.style.height = "44px"; // Set back to min height
      }

      // Refocus after a short delay, only if not disabled
      setTimeout(() => {
        if (!disabled) {
          inputRef.current?.focus();
        }
      }, 10);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize logic
    const textarea = e.target;
    textarea.style.height = "auto"; // Reset height to recalculate scrollHeight
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px"; // Apply new height up to max
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) { // Check disabled state
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
              disabled={disabled} // HTML disabled attribute
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
            disabled={disabled} // Disable button
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;