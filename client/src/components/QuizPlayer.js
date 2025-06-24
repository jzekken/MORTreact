import React, { useState, useEffect } from 'react';

const QuizPlayer = ({ quiz, onFinish, onClose }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const question = quiz[index];

  const handleOptionClick = (i) => {
    if (showAnswer) return;
    setSelected(i);
    setShowAnswer(true);
    if (i === question.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    const isCorrect = selected === question.correct;
    const updatedScore = isCorrect ? score + 1 : score;

    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setFinalScore(updatedScore);
      const percent = Math.round((updatedScore / quiz.length) * 100);
      setPercentage(percent);
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (showResult && onFinish) {
      onFinish({
        score: finalScore,
        total: quiz.length,
        title: quiz.title || 'Untitled Quiz',
        date: new Date().toLocaleString(),
      });
    }
  }, [showResult]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        textAlign: 'center'
      }}>
        {showResult ? (
          <div>
            <h2>Quiz Completed 🎉</h2>
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(#4CAF50 0% ${percentage}%, #eee ${percentage}% 100%)`,
              margin: '1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {finalScore}/{quiz.length}
              </div>
            </div>
            <button onClick={onClose} style={{ marginTop: '1rem' }}>❌ Close</button>
          </div>
        ) : (
          <>
            <h2>Question {index + 1} of {quiz.length}</h2>
            <p style={{ fontSize: '18px', marginBottom: '1.5rem' }}>{question.question}</p>

            {question.options.map((option, i) => {
              let bg = '#eee';
              if (showAnswer) {
                if (i === question.correct) bg = '#4CAF50';
                else if (i === selected) bg = '#F44336';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    margin: '0.5rem 0',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: bg,
                    color: '#000',
                    cursor: showAnswer ? 'default' : 'pointer'
                  }}
                >
                  {option}
                </button>
              );
            })}

            {showAnswer && question.explanation && (
              <div style={{
                marginTop: '1rem',
                backgroundColor: '#f0f0f0',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <strong>Explanation:</strong>
                <p>{question.explanation || "No explanation provided."}</p>
              </div>
            )}

            {showAnswer && (
              <button onClick={handleNext} style={{ marginTop: '1rem' }}>
                {index + 1 < quiz.length ? 'Next' : 'Finish'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
