import React, { useState, useRef } from 'react';
import Summary from './Summary';
import ChatbotWidget from './ChatbotWidget';
import QuizPlayer from './QuizPlayer';
import '../NotesTab.css';

const PdfTab = ({ onSaveNote }) => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [chatContext, setChatContext] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const dropRef = useRef(null);
  const [showFullText, setShowFullText] = useState(false);

  const handleUpload = async (uploadFile = file) => {
    if (!uploadFile) return alert('Please upload a file.');

    const formData = new FormData();
    formData.append('file', uploadFile);

    let endpoint = '';
    if (uploadFile.type === 'application/pdf') {
      endpoint = '/upload';
    } else if (uploadFile.name.endsWith('.docx')) {
      endpoint = '/upload-docx';
    } else if (uploadFile.name.endsWith('.pptx')) {
      endpoint = '/upload-pptx';
    } else if (uploadFile.type.startsWith('image/')) {
      endpoint = '/upload-image';
    } else {
      return alert('Unsupported file type.');
    }

    try {
      const res = await fetch(`https://reactmort-server.onrender.com${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.text) {
        setExtractedText(data.text);
      } else {
        alert('Failed to extract text.');
      }
    } catch (err) {
      alert('Error uploading file.');
    }
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
      setExtractedText('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    } else {
      alert('Only supported files are allowed.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add('drag-over');
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove('drag-over');
  };

  return (
    <div className="pdf-tab">
      <div className="header">
        <h1>Document Scanner</h1>
      </div>

      <div
        ref={dropRef}
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label htmlFor="pdfInput" className="upload-btn">
          Upload a File <span className="upload-icon">📤</span>
        </label>
        <p className="upload-hint">
          or<br />Drag & drop PDF, DOCX, PPTX, or Image
        </p>
        <input
          id="pdfInput"
          type="file"
          accept=".pdf,.docx,.pptx,image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            handleUpload(e.target.files[0]);
          }}
          hidden
        />
      </div>

      {extractedText && (
        <div className="summary-card">
          <div className="summary-header">
            <h3>Extracted Summary</h3>
            <button className="btn btn-primary" onClick={() => handleSaveNote(extractedText)}>
              + Add to Notes
            </button>
          </div>
          <div className="summary-text">
            <strong>Summary Result</strong>
            {extractedText
              .split(/\n{2,}/)
              .slice(0, showFullText ? undefined : 2)
              .map((para, i) => <p key={i}>{para.trim()}</p>)}

            {extractedText.split(/\n{2,}/).length > 3 && (
              <button
                className="btn-secondary"
                onClick={() => setShowFullText(!showFullText)}
                style={{ marginTop: '0.5rem' }}
              >
                {showFullText ? 'Show Less ▲' : 'Show More ▼'}
              </button>
            )}
          </div>

          <div className="btn-group" style={{ marginTop: '1rem' }}>
            <button className="btn" onClick={() => handleSaveNote(extractedText)}>
              💾 Save as Note
            </button>
            <button className="btn" onClick={() => generateQuiz(extractedText)}>
              🧠 Generate Quiz
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Summary text={extractedText} onSave={(summary) => handleSaveNote(summary)} />
          </div>
        </div>
      )}

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

      <div className="chatbot-float">
        <ChatbotWidget contextNote={chatContext} />
      </div>
    </div>
  );
};

export default PdfTab;
