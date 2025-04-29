import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'fr' | 'es' | 'de';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to OnePoint GenAI Eco',
    startConversation: 'Start a conversation by typing a message below. I\'m here to help with any questions you might have.',
    newChat: 'New Chat',
    searchConversations: 'Search conversations...',
    online: 'Online',
    typeMessage: 'Type a message...',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    noConversations: 'No conversations found',
    freePlan: 'Free Plan',
    howDoesThisWork: 'How does this work?',
    whatCanYouHelp: 'What can you help me with?',
    tellJoke: 'Tell me a joke',
    weatherToday: 'What\'s the weather today?'
  },
  fr: {
    welcome: 'Bienvenue à OnePoint GenAI Eco',
    startConversation: 'Commencez une conversation en tapant un message ci-dessous. Je suis là pour vous aider avec vos questions.',
    newChat: 'Nouvelle Conversation',
    searchConversations: 'Rechercher des conversations...',
    online: 'En ligne',
    typeMessage: 'Tapez un message...',
    settings: 'Paramètres',
    darkMode: 'Mode sombre',
    language: 'Langue',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer les modifications',
    noConversations: 'Aucune conversation trouvée',
    freePlan: 'Plan gratuit',
    howDoesThisWork: 'Comment ça marche?',
    whatCanYouHelp: 'Comment pouvez-vous m\'aider?',
    tellJoke: 'Racontez-moi une blague',
    weatherToday: 'Quel temps fait-il aujourd\'hui?'
  },
  es: {
    welcome: 'Bienvenido a OnePoint GenAI Eco',
    startConversation: 'Inicia una conversación escribiendo un mensaje a continuación. Estoy aquí para ayudarte con cualquier pregunta que puedas tener.',
    newChat: 'Nueva Conversación',
    searchConversations: 'Buscar conversaciones...',
    online: 'En línea',
    typeMessage: 'Escribe un mensaje...',
    settings: 'Configuración',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    noConversations: 'No se encontraron conversaciones',
    freePlan: 'Plan gratuito',
    howDoesThisWork: '¿Cómo funciona esto?',
    whatCanYouHelp: '¿En qué puedes ayudarme?',
    tellJoke: 'Cuéntame un chiste',
    weatherToday: '¿Qué tiempo hace hoy?'
  },
  de: {
    welcome: 'Willkommen bei OnePoint GenAI Eco',
    startConversation: 'Beginnen Sie ein Gespräch, indem Sie unten eine Nachricht eingeben. Ich bin hier, um Ihnen bei Fragen zu helfen.',
    newChat: 'Neuer Chat',
    searchConversations: 'Unterhaltungen suchen...',
    online: 'Online',
    typeMessage: 'Nachricht eingeben...',
    settings: 'Einstellungen',
    darkMode: 'Dunkelmodus',
    language: 'Sprache',
    cancel: 'Abbrechen',
    saveChanges: 'Änderungen speichern',
    noConversations: 'Keine Gespräche gefunden',
    freePlan: 'Kostenloser Plan',
    howDoesThisWork: 'Wie funktioniert das?',
    whatCanYouHelp: 'Womit kannst du mir helfen?',
    tellJoke: 'Erzähl mir einen Witz',
    weatherToday: 'Wie ist das Wetter heute?'
  }
};

// Load settings from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

// Save settings to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Get preferred color scheme from system
  const getPreferredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Initialize state from localStorage or defaults
  const [theme, setTheme] = useState<Theme>(() => 
    loadFromStorage('theme', getPreferredTheme())
  );
  const [language, setLanguageState] = useState<Language>(() => 
    loadFromStorage('language', 'en')
  );

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage('theme', theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    saveToStorage('language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      language,
      toggleTheme,
      setLanguage,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};