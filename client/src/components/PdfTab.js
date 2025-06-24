import React, { useState } from 'react';
import Summary from './Summary';
import ChatbotWidget from './ChatbotWidget';
import QuizPlayer from './QuizPlayer';
import '../NotesTab.css'; // Ensures consistent styling with NotesTab

const PdfTab = ({ onSaveNote }) => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [chatContext, setChatContext] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF file first.');
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch('https://reactmort-server.onrender.com/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setExtractedText(data.text);
  };

  const generateQuiz = async (textToUse) => {
    const res = await fetch('https://reactmort-server.onrender.com/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse }),
    });
    const data = await res.json();
    if (data.quiz) {
      setQuiz(data.quiz);
      setQuizScore(null);
    } else {
      alert('Quiz generation failed.');
    }
  };

  const handleSaveNote = (text) => {
    if (onSaveNote && text.trim()) {
      onSaveNote({
        id: Date.now(),
        title: `Note ${Date.now()}`,
        content: text,
      });
    }
  };

  return (
    <div className="todo-app">
      <div className="card">
        <h1 className="section-title">📄 PDF Extractor & Summarizer</h1>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label><strong>📎 Upload PDF File</strong></label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: '0.5rem' }}
          />
          <button className="btn primary" style={{ marginTop: '0.8rem' }} onClick={handleUpload}>
            Upload & Extract
          </button>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label><strong>📜 Extracted Text</strong></label>
          <textarea
            className="input full"
            value={extractedText}
            readOnly
            rows={10}
            placeholder="Extracted text will appear here..."
            style={{ marginTop: '0.5rem' }}
          />
        </div>

        <div className="btn-group" style={{ marginBottom: '1.5rem' }}>
          <button
            className="btn success"
            disabled={!extractedText.trim()}
            onClick={() => handleSaveNote(extractedText)}
          >
            💾 Save as Note
          </button>
          <button
            className="btn warn"
            disabled={!extractedText.trim()}
            onClick={() => generateQuiz(extractedText)}
          >
            🧠 Generate Quiz
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <Summary
            text={extractedText}
            onSave={(summary) => handleSaveNote(summary)}
          />
        </div>
      </div>

      {quiz && (
        <div className="modal-backdrop">
          <QuizPlayer
            quiz={quiz}
            onFinish={(score, total) => {
              setQuizScore({ score, total });
              setQuiz(null);
            }}
            onClose={() => setQuiz(null)}
          />
        </div>
      )}

      {quizScore && (
        <div className="quiz-score">
          <h2>✅ Quiz Completed</h2>
          <p>Your Score: {quizScore.score} / {quizScore.total}</p>
        </div>
      )}

      <ChatbotWidget contextNote={chatContext} />
    </div>
  );
};

export default PdfTab;
