import React, { useRef, useEffect, useState } from 'react';
import { X, Moon, Sun, Languages } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, language, toggleTheme, setLanguage, t } = useSettings();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Create local state to track changes before saving
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);

  // Update local state when props change (modal opens)
  useEffect(() => {
    setLocalTheme(theme);
    setLocalLanguage(language);
  }, [isOpen, theme, language]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSaveChanges = () => {
    // Only apply changes when save is clicked
    if (localTheme !== theme) {
      toggleTheme();
    }
    if (localLanguage !== language) {
      setLanguage(localLanguage);
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset local state to current values (discard changes)
    setLocalTheme(theme);
    setLocalLanguage(language);
    onClose();
  };

  // Local toggle function that only updates the local state
  const handleLocalThemeToggle = () => {
    setLocalTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ease-in-out"
        style={{ 
          animationName: 'fadeIn',
          animationDuration: '0.3s',
          animationFillMode: 'both'
        }}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings')}</h2>
          <button 
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {localTheme === 'dark' ? (
                <Moon size={20} className="text-gray-600 dark:text-gray-300 mr-3" />
              ) : (
                <Sun size={20} className="text-amber-500 mr-3" />
              )}
              <span className="text-gray-800 dark:text-gray-200">{t('darkMode')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localTheme === 'dark'}
                onChange={handleLocalThemeToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Languages size={20} className="text-gray-600 dark:text-gray-300 mr-3" />
              <span className="text-gray-800 dark:text-gray-200">{t('language')}</span>
            </div>
            <select 
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              value={localLanguage}
              onChange={(e) => setLocalLanguage(e.target.value as 'en' | 'fr' | 'es' | 'de')}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors mr-2"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;