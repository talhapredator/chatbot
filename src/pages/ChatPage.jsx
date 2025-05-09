import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/chat.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'How can I help you today? You can upload documents or ask questions.' },
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsQuerying(true);

    try {
      const formData = new FormData();
      formData.append('query', input);
      
      const response = await axios.post('https://5c51-202-47-34-45.ngrok-free.app/query', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response.data.response || "I couldn't find an answer in the documents."
      }]);
    } catch (error) {
      let errorMessage = 'Error processing your query';
      if (error.response) {
        // Handle different error cases
        if (error.response.status === 400) {
          errorMessage = "Please upload documents first before querying";
        } else if (error.response.status === 422) {
          errorMessage = "Invalid query format";
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: errorMessage
      }]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter for allowed file types
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    const validFiles = Array.from(files).filter(file => 
      allowedTypes.includes(file.type) || 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md')
    );

    if (validFiles.length === 0) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Please upload only PDF, TXT, or MD files.' 
      }]);
      return;
    }

    setIsUploading(true);
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: `Uploading ${validFiles.length} document(s) for processing...`,
      files: validFiles 
    }]);

    try {
      const formData = new FormData();
      validFiles.forEach(file => formData.append('files', file));

      const response = await axios.post('https://5c51-202-47-34-45.ngrok-free.app/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Documents processed successfully! You can now ask questions about them.`
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: error.response?.data?.detail || 'Failed to process documents'
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container">
      <header className="header">
        <div className="logo">RAG Chatbot</div>
        <div className="header-actions">
          <button 
            className="new-folder"
            onClick={triggerFileInput}
            disabled={isUploading || isQuerying}
          >
            {isUploading ? (
              <span className="uploading-text">Processing Documents...</span>
            ) : (
              'Add Documents'
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            multiple
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          />
          <span className="rag-label">RAG Based System</span>
        </div>
      </header>

      <main className="main">
        <section className="chat-area-wrapper">
          <section className="chat-area">
            <h2 className="chat-title">Chatbot</h2>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`bubble ${msg.role}`}>
                  {msg.text}
                  {msg.files && (
                    <div className="file-list">
                      {msg.files.map((file, fileIdx) => (
                        <div key={fileIdx} className="file-item">
                          <span className="file-icon">
                            {file.type === 'application/pdf' ? '📕' : 
                             file.type === 'text/plain' ? '📝' : '📄'}
                          </span>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
              <input
                type="text"
                placeholder={isQuerying ? "Processing your query..." : "Ask about your documents..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isQuerying && handleSend()}
                disabled={isQuerying}
              />
              <button 
                onClick={handleSend}
                disabled={isQuerying || !input.trim()}
              >
                {isQuerying ? '...' : '➤'}
              </button>
            </div>
          </section>
        </section>

        <aside className="sidebar">
          <h3>Document Tips</h3>
          <button className="trend" onClick={() => setInput("Summarize the key points from my documents")}>
            Summarize Documents
          </button>
          <button className="trend" onClick={() => setInput("Find similar concepts across my documents")}>
            Find Similar Concepts
          </button>
          <button className="trend" onClick={() => setInput("What are the main topics in my documents?")}>
            Identify Main Topics
          </button>
        </aside>
      </main>
    </div>
  );
};

export default ChatPage;
