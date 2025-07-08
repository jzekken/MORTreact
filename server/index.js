const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const { CohereClient } = require("cohere-ai");
const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// PDF Upload Endpoint
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('pdf'), async (req, res) => {
  const pdfParse = require('pdf-parse');
  try {
    const pdfData = await pdfParse(req.file.buffer); // use buffer from memory
    res.json({ text: pdfData.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to extract PDF text' });
  }
});

// GEMINI SUMMARY ENDPOINT
app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  try {
    const prompt = `You're a smart and helpful study assistant. Convert the following academic text into detailed, structured study notes.\n\n- Use bullet points and headings where appropriate.\n- Simplify complex terms into plain language.\n- Include important definitions, examples, and explanations.\n- Keep the tone academic but student-friendly.\n\nText to convert:\n${text}`;
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 600,
      temperature: 0.7,
    });
    const summary = response.body.generations[0].text;
    res.json({ summary });
  } catch (error) {
    console.error('Cohere Error:', error.message);
    res.status(500).json({ error: 'Failed to summarize text with Cohere.' });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 Server is live!');
});

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 300,
      temperature: 0.7,
    });
    const reply = response.body.generations[0].text;
    res.json({ reply });
  } catch (err) {
    console.error('Cohere Chatbot Error:', err.message);
    res.status(500).json({ reply: "Sorry, I couldn't answer that." });
  }
});

// QUIZ GENERATION ENDPOINT
app.post('/generate-quiz', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'No content provided.' });
  }
  try {
    const prompt = `You're a study assistant. Generate 5 multiple-choice questions from the following content.\n\nEach question object must include:\n- "question": string\n- "options": array of 4 strings\n- "correct": integer (0–3) for the correct answer\n- "explanation": a helpful string explaining why the correct answer is correct\n\nOnly respond with a valid JSON array of 5 question objects. No extra commentary.\n\nContent:\n${text}`;
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 800,
      temperature: 0.7,
    });
    const responseText = response.body.generations[0].text;
    const jsonStart = responseText.indexOf('[');
    const jsonEnd = responseText.lastIndexOf(']') + 1;
    const cleanJson = responseText.slice(jsonStart, jsonEnd);
    const quiz = JSON.parse(cleanJson);
    const quizWithExplanations = quiz.map(q => ({
      ...q,
      explanation: q.explanation || "No explanation provided."
    }));
    res.json({ quiz: quizWithExplanations });
  } catch (err) {
    console.error('❌ Quiz generation error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate quiz. Try with simpler or shorter text.' });
  }
});

app.post('/custom-quiz', async (req, res) => {
  const { text, count, types } = req.body;
  if (!text || !count || !types || types.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: text, count, or types' });
  }
  try {
    const typeInstructions = types.map(type => {
      switch (type) {
        case 'multipleChoice': return 'multiple-choice';
        case 'trueFalse': return 'true or false';
        case 'identification': return 'identification';
        default: return '';
      }
    }).join(', ');
    const prompt = `You are a quiz generator. Based on the following academic content, generate exactly ${count} quiz questions.\n\nOnly include the following types of questions: ${typeInstructions}.\nDo NOT include any question types outside of these.\n\nEach question must include:\n- "question": the question text\n- "type": either "multipleChoice", "trueFalse", or "identification"\n- "options": array of options (only for multipleChoice and trueFalse)\n- "correct": the correct answer (index for MCQ/TF, string for ID)\n- "explanation": a brief explanation for the answer\n\n⚠️ VERY IMPORTANT: Only return a valid JSON array of exactly ${count} quiz question objects.\nDo NOT return more or fewer than ${count}. Do NOT include any commentary, markdown, headings, or other text outside the JSON array.\n\nAcademic content:\n${text}`;
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 1200,
      temperature: 0.7,
    });
    const responseText = response.body.generations[0].text;
    const jsonStart = responseText.indexOf('[');
    const jsonEnd = responseText.lastIndexOf(']') + 1;
    const cleanJson = responseText.slice(jsonStart, jsonEnd);
    const quiz = JSON.parse(cleanJson);
    if (!Array.isArray(quiz) || quiz.length !== Number(count)) {
      console.warn(`⚠️ Cohere returned ${quiz.length} questions instead of ${count}`);
      return res.status(500).json({ error: `Received ${quiz.length} questions instead of ${count}. Try again or simplify the input.` });
    }
    res.json({ quiz });
  } catch (err) {
    console.error('❌ Custom quiz error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate custom quiz. Try again.' });
  }
});

app.post('/generate-flashcards', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Missing input text' });
  }
  try {
    const prompt = `You're an AI tutor. Generate flashcards from the academic content below.\n\nOutput format:\n[\n  { "question": "...", "answer": "..." },\n  ...\n]\n\nText:\n${text}`;
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      max_tokens: 800,
      temperature: 0.7,
    });
    const raw = response.body.generations[0].text;
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']') + 1;
    const json = raw.slice(start, end);
    const flashcards = JSON.parse(json);
    res.json({ flashcards });
  } catch (err) {
    console.error('Flashcard error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

const { extractDocxText, extractPptxText, extractImageText } = require('./extractors');

// DOCX Upload
app.post('/upload-docx', upload.single('file'), async (req, res) => {
  try {
    const text = await extractDocxText(req.file.buffer);
    res.json({ text });
  } catch (err) {
    console.error('DOCX error:', err.message);
    res.status(500).json({ error: 'Failed to extract DOCX text' });
  }
});

// PPTX Upload
app.post('/upload-pptx', upload.single('file'), async (req, res) => {
  try {
    const text = await extractPptxText(req.file.buffer);
    res.json({ text });
  } catch (err) {
    console.error('PPTX error:', err.message);
    res.status(500).json({ error: 'Failed to extract PPTX text' });
  }
});

// IMAGE OCR Upload
app.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    const text = await extractImageText(req.file.buffer);
    res.json({ text });
  } catch (err) {
    console.error('Image OCR error:', err.message);
    res.status(500).json({ error: 'Failed to extract text from image' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
