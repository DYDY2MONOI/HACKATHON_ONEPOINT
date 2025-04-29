import React from 'react';
import Layout from './components/layout/Layout';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <Layout />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;