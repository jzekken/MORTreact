import React from 'react';
import { marked } from 'marked';

const NoteCard = ({ note, onView, onDelete, onUseAsContext }) => {
  return (
    <div
      style={{
        background: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        position: 'relative',
        width: '240px'
      }}
      onClick={() => onView(note)}
    >
      <h3>{note.title}</h3>

      <div
        dangerouslySetInnerHTML={{
          __html: marked.parse(note.content.slice(0, 300) + '...')
        }}
        style={{ fontSize: '14px', lineHeight: '1.4' }}
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
          cursor: 'pointer'
        }}
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
          cursor: 'pointer'
        }}
      >
        📌 Use as Chat Context
      </button>
    </div>
  );
};

export default NoteCard;
