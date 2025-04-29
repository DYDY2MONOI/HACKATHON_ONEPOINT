import React from 'react';
import Layout from './components/layout/Layout';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';
import { ExportControls } from './components/chat/ExportControl';

function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <Layout />

        <ExportControls />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;
