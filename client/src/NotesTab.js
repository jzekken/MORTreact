// NotesTab.js
import React, { useState, useEffect } from 'react';
import ChatbotWidget from './components/ChatbotWidget';
import NoteGrid from './components/NoteGrid';
import QuizPlayer from './components/QuizPlayer';
import { marked } from 'marked';
import './NotesTab.css';

function NotesTab({ notes, setNotes }) {
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quizHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const generateQuiz = async (textToUse) => {
    const res = await fetch('https://reactmort-server.onrender.com/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToUse })
    });
    const data = await res.json();
    if (data.quiz) {
      setQuiz(data.quiz);
    } else {
      alert('Quiz generation failed.');
    }
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return alert('Title and content are required.');
    const newEntry = { id: Date.now(), ...newNote };
    setNotes(prev => [...prev, newEntry]);
    setNewNote({ title: '', content: '' });
    setAddingNote(false);
  };

  return (
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>Notes</h2>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <div className="card">
          <h3>📚 Saved Notes</h3>
          <NoteGrid
            notes={notes}
            onView={setViewingNote}
            onDelete={(id) => setNotes(prev => prev.filter(note => note.id !== id))}
            onReorder={setNotes}
            onUseAsContext={(note) => {
              setChatContext(note);
              alert(`Chat context set to "${note.title}"`);
            }}
            onAddNote={() => setAddingNote(true)}
          />
        </div>
      </div>

      <div className="right-panel">
        <div className="task-status">
          <h3>Spotify</h3>
          <div className="spotify-player">
            <iframe
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3PFzdbtx1Us?utm_source=generator"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="spotify-player"
            ></iframe>
          </div>
        </div>

        <div className="completed-tasks">
          <h3>Completed Quiz</h3>
          {quizHistory.length > 0 ? (
            quizHistory.map((quiz) => (
              <div className="task-row completed" key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="task-title">{quiz.title}</div>
                  <div className="task-date">{quiz.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="task-score">{quiz.score} / {quiz.total}</div>
                  <button
                    className="btn danger"
                    onClick={() => {
                      const updated = quizHistory.filter(q => q.id !== quiz.id);
                      setQuizHistory(updated);
                      localStorage.setItem('quizHistory', JSON.stringify(updated));
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No quiz taken yet.</p>
          )}
        </div>
      </div>

      {viewingNote && (
  <div className="modal-backdrop">
    <div className="modal">
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setViewingNote(null)}
          className="btn danger"
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            fontSize: '1.2rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            zIndex: 10,
          }}
          title="Close"
        >
          ❌
        </button>
        <h2>{viewingNote.title}</h2>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: marked.parse(viewingNote.content) }}
        className="note-content"
      />

      <div className="btn-group">
        <button className="btn" onClick={() => {
          setEditingNote(viewingNote);
          setViewingNote(null);
        }}>✏️ Edit</button>
        <button className="btn" onClick={() => generateQuiz(viewingNote.content)}>🧠 Quiz</button>
      </div>
    </div>
  </div>
)}


      {editingNote && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Edit Note</h2>
            <input
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="input full"
            />
            <textarea
              rows={10}
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="input full"
            />
            <div className="btn-group">
              <button
                className="btn success"
                onClick={() => {
                  setNotes(prev => prev.map(note => note.id === editingNote.id ? editingNote : note));
                  setEditingNote(null);
                }}>✅ Save
              </button>
              <button className="btn danger" onClick={() => setEditingNote(null)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addingNote && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Add New Note</h2>
            <input
              placeholder="Note Title"
              className="input full"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <textarea
              rows={10}
              placeholder="Write your note..."
              className="input full"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <div className="btn-group">
              <button className="btn success" onClick={handleAddNote}>✅ Add</button>
              <button className="btn danger" onClick={() => setAddingNote(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {quiz && (
        <div className="modal-backdrop">
          <QuizPlayer
            quiz={quiz}
            onFinish={({ score, total, title, date }) => {
              const result = { id: Date.now(), score, total, title, date };
              const updated = [result, ...quizHistory];
              setQuizHistory(updated);
              localStorage.setItem('quizHistory', JSON.stringify(updated));
            }}
            onClose={() => setQuiz(null)}
          />
        </div>
      )}

      <ChatbotWidget contextNote={chatContext} />
    </div>
  );
}

export default NotesTab;
