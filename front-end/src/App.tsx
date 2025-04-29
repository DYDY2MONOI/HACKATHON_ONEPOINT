import React from 'react';
import Layout from './components/layout/Layout';
import { ChatProvider } from './context/ChatContext';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <Layout />
    </ChatProvider>
  );
}

export default App;