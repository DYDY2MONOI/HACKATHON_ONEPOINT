import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Nouvelle conversation' }
  ]);
  const [activeChat, setActiveChat] = useState(1);

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message
    setMessages([...messages, { text: input, isBot: false }]);

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Je suis un chatbot OnePoint. Je suis en cours de développement.",
        isBot: true
      }]);
    }, 1000);

    setInput('');
  };

  const startNewChat = () => {
    const newId = chatHistory.length ? Math.max(...chatHistory.map(chat => chat.id)) + 1 : 1;
    setChatHistory([...chatHistory, { id: newId, title: `Conversation ${newId}` }]);
    setActiveChat(newId);
    setMessages([{ text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", isBot: true }]);
  };

  return (
    <div className="App">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src="/onepoint_logo.png" alt="OnePoint Logo" className="sidebar-logo" style={{ width: '200px', height: 'auto' }} />
        </div>
        <div className="history-list">
          {chatHistory.map(chat => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === activeChat ? 'active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <span className="chat-icon">💬</span>
              <span className="chat-title">{chat.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <header className="header">
          <h1>OnePoint Assistant</h1>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.isBot ? 'bot' : 'user'}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question ici..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button onClick={handleSend}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
