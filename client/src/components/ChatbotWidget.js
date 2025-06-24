import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiMic, FiSend } from 'react-icons/fi';
import axios from 'axios';

const ChatbotWidget = ({ contextNote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (e) => console.error('Speech error:', e);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setChat(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const promptText = contextNote
        ? `Using this note:\n"${contextNote.content}"\n\nUser asked: ${input}`
        : input;

      const res = await axios.post('https://reactmort-server.onrender.com/chat', { prompt: promptText });
      const botMsg = { role: 'bot', text: res.data.reply };
      setChat(prev => [...prev, botMsg]);
      speak(res.data.reply);
    } catch {
      const errorMsg = '⚠️ Error from bot.';
      setChat(prev => [...prev, { role: 'bot', text: errorMsg }]);
      speak(errorMsg);
    }

    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
        >
          <FiMessageCircle />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: '320px',
            height: '470px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 12px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#007bff',
              color: '#fff',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>M.O.R.T. Helper</strong>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Chat messages */}
          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              fontSize: '14px',
              background: '#fafafa',
            }}
          >
            {contextNote && (
              <div style={{ background: '#eef7ff', padding: '5px 8px', marginBottom: '10px', fontSize: '12px' }}>
                🔗 Using note: <strong>{contextNote.title}</strong>
              </div>
            )}
            {chat.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '10px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    background: msg.role === 'user' ? '#DCF8C6' : '#e9e9e9',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    maxWidth: '85%',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div>⏳ Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Buttons */}
          <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />

              <button
                    onClick={startListening}
                    title="Voice input"
                    style={{
                      background: '#f1f1f1',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transform: 'scaleX(1)', // ← FIX flip if browser auto-mirrors
                    }}
                  >
                    <FiMic size={18} style={{ transform: 'scaleX(1)' }} />
                  </button>


              <button
                onClick={handleSend}
                title="Send"
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
