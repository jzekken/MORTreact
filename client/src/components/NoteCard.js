import React from 'react';
import { marked } from 'marked';

const NoteCard = ({ note, onView, onDelete, onUseAsContext }) => {
  return (
    <div
      className="note-card"
      onClick={() => onView(note)}
      style={{
        position: 'relative',
        width: '240px',
        cursor: 'pointer',
      }}
    >
      <h3>{note.title}</h3>

      <div
        dangerouslySetInnerHTML={{
          __html: marked.parse(note.content.slice(0, 300) + '...')
        }}
        style={{
          fontSize: '14px',
          lineHeight: '1.4',
        }}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          color: 'red',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
        }}
        title="Delete"
      >
        ×
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUseAsContext(note);
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '12px',
          border: 'none',
          borderRadius: '6px',
          padding: '4px 6px',
          cursor: 'pointer',
        }}
        title="Use as chat context"
      >
        📌
      </button>
    </div>
  );
};

export default NoteCard;
