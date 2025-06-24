import React, { useState } from 'react';
import axios from 'axios';

const QuizGenerator = ({ sourceText, sourceTitle }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});

  const generateQuiz = async () => {
    setQuiz(null);
    setLoading(true);
    try {
      const res = await axios.post('https://reactmort-server.onrender.com/generate-quiz', { text: sourceText });
      setQuiz(res.data.quiz);
      setAnswers({});
    } catch (err) {
      console.error(err);
      alert('Error generating quiz.');
    }
    setLoading(false);
  };

  const handleSelect = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = quiz
    ? quiz.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)
    : null;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h3>Quiz Generator: {sourceTitle}</h3>
      <button onClick={generateQuiz} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>

      {quiz && (
        <div style={{ marginTop: '1rem' }}>
          {quiz.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{i + 1}. {q.question}</strong>
              <div>
                {q.options.map((opt, oi) => (
                  <label key={oi} style={{ display: 'block', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i] === oi}
                      onChange={() => handleSelect(i, oi)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {answers[i] != null && (
                <div style={{ color: answers[i] === q.correct ? 'green' : 'red' }}>
                  {answers[i] === q.correct ? '✅ Correct' : `❌ Wrong. Correct answer: “${q.options[q.correct]}”`}
                </div>
              )}
            </div>
          ))}
          <div>
            <strong>Score: {score} / {quiz.length}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
